import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

interface FedExConfig {
  apiKey: string;
  secretKey: string;
  accountNumber: string;
  meterNumber: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface FedExAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
}

interface FedExShipmentRequest {
  accountNumber: string;
  serviceType: string;
  packagingType: string;
  shipper: {
    contact: {
      personName: string;
      emailAddress: string;
      phoneNumber: string;
    };
    address: FedExAddress;
  };
  recipients: Array<{
    contact: {
      personName: string;
      emailAddress?: string;
      phoneNumber?: string;
    };
    address: FedExAddress;
  }>;
  pickupType: string;
  rateRequestType: string[];
  requestedPackageLineItems: Array<{
    sequenceNumber: number;
    groupNumber: number;
    groupPackageCount: number;
    insuredValue: {
      amount: number;
      currency: string;
    };
    weight: {
      units: string;
      value: number;
    };
    dimensions: {
      length: number;
      width: number;
      height: number;
      units: string;
    };
  }>;
  labelSpecification: {
    imageType: string;
    labelStockType: string;
    labelPrintingOrientation: string;
    labelOrder: string;
  };
}

class FedExServerAdapter {
  private config: FedExConfig;
  private authToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.config = {
      apiKey: process.env.FEDEX_API_KEY || '',
      secretKey: process.env.FEDEX_SECRET_KEY || '',
      accountNumber: process.env.FEDEX_ACCOUNT_NUMBER || '',
      meterNumber: process.env.FEDEX_METER_NUMBER || '',
      baseUrl: process.env.FEDEX_BASE_URL || 'https://apis-sandbox.fedex.com',
      environment: (process.env.FEDEX_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
    };
  }

  private async authenticate(): Promise<string> {
    if (this.authToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.authToken;
    }

    const authUrl = `${this.config.baseUrl}/oauth/token`;
    
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.config.apiKey,
        client_secret: this.config.secretKey
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FedEx認証エラー: ${response.status} - ${errorText}`);
    }

    const authResult = await response.json();
    this.authToken = authResult.access_token;
    this.tokenExpiry = new Date();
    this.tokenExpiry.setSeconds(this.tokenExpiry.getSeconds() + authResult.expires_in - 60);

    return this.authToken || '';
  }

  async generateShippingLabel(item: any, service: string = 'standard'): Promise<{
    trackingNumber: string;
    labelData: string;
    cost: number;
    currency: string;
    estimatedDelivery?: string;
  }> {
    try {
      const token = await this.authenticate();

      const serviceTypeMap: Record<string, string> = {
        standard: 'FEDEX_GROUND',
        express: 'FEDEX_EXPRESS_SAVER',
        priority: 'PRIORITY_OVERNIGHT'
      };

      const shippingAddress = this.parseAddress(item.shippingAddress);
      
      const shipmentRequest: FedExShipmentRequest = {
        accountNumber: this.config.accountNumber,
        serviceType: serviceTypeMap[service] || 'FEDEX_GROUND',
        packagingType: 'YOUR_PACKAGING',
        shipper: {
          contact: {
            personName: 'THE WORLD DOOR',
            emailAddress: 'shipping@theworlddoor.com',
            phoneNumber: '+81-3-1234-5678'
          },
          address: {
            streetLines: ['東京都渋谷区神南1-1-1'],
            city: '渋谷区',
            stateOrProvinceCode: '13',
            postalCode: '150-0041',
            countryCode: 'JP',
            residential: false
          }
        },
        recipients: [{
          contact: {
            personName: item.customer || 'Customer',
            emailAddress: item.customerEmail || undefined,
            phoneNumber: item.customerPhone || undefined
          },
          address: {
            streetLines: [shippingAddress.street],
            city: shippingAddress.city,
            stateOrProvinceCode: shippingAddress.state,
            postalCode: shippingAddress.postalCode || '',
            countryCode: shippingAddress.countryCode || 'JP',
            residential: true
          }
        }],
        pickupType: 'USE_SCHEDULED_PICKUP',
        rateRequestType: ['ACCOUNT', 'LIST'],
        requestedPackageLineItems: [{
          sequenceNumber: 1,
          groupNumber: 1,
          groupPackageCount: 1,
          insuredValue: {
            amount: item.value || 10000,
            currency: 'JPY'
          },
          weight: {
            units: 'KG',
            value: this.estimateWeight(item)
          },
          dimensions: {
            length: 25,
            width: 20,
            height: 10,
            units: 'CM'
          }
        }],
        labelSpecification: {
          imageType: 'PDF',
          labelStockType: 'PAPER_4X6',
          labelPrintingOrientation: 'TOP_EDGE_OF_TEXT_FIRST',
          labelOrder: 'SHIPPING_LABEL_FIRST'
        }
      };

      const response = await fetch(`${this.config.baseUrl}/ship/v1/shipments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-locale': 'ja_JP'
        },
        body: JSON.stringify(shipmentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`FedEx配送ラベル生成エラー: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(`FedEx APIエラー: ${result.errors.map((e: any) => e.message).join(', ')}`);
      }

      const shipment = result.output?.transactionShipments?.[0];
      if (!shipment) {
        throw new Error('配送ラベルの生成に失敗しました');
      }

      const document = shipment.shipmentDocuments?.[0];
      const trackingId = shipment.completedShipmentDetail?.trackingIds?.[0];
      const rateDetail = shipment.completedShipmentDetail?.shipmentRating?.shipmentRateDetails?.[0];

      return {
        trackingNumber: trackingId?.trackingNumber || '',
        labelData: document?.encodedLabel || '',
        cost: rateDetail?.totalNetCharge?.amount || 0,
        currency: rateDetail?.totalNetCharge?.currency || 'JPY',
        estimatedDelivery: this.calculateEstimatedDelivery(service)
      };

    } catch (error) {
      console.error('FedEx配送ラベル生成エラー:', error);
      throw error;
    }
  }

  private parseAddress(addressString: string): {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  } {
    const lines = addressString.split('\n').filter(line => line.trim());
    
    return {
      street: lines[0] || '',
      city: lines[1] || '',
      state: '13',
      postalCode: this.extractPostalCode(addressString) || '',
      countryCode: 'JP'
    };
  }

  private extractPostalCode(address: string): string | null {
    const postalCodeRegex = /〒?(\d{3}-?\d{4})/;
    const match = address.match(postalCodeRegex);
    return match ? match[1].replace('-', '') : null;
  }

  private estimateWeight(item: any): number {
    const categoryWeights: Record<string, number> = {
      'camera': 1.5,
      'lens': 0.8,
      'watch': 0.3,
      'electronics': 1.0,
      'default': 0.5
    };

    const category = item.category?.toLowerCase() || 'default';
    return categoryWeights[category] || categoryWeights.default;
  }

  private calculateEstimatedDelivery(service: string): string {
    const now = new Date();
    let deliveryDays: number;

    switch (service) {
      case 'priority':
        deliveryDays = 1;
        break;
      case 'express':
        deliveryDays = 2;
        break;
      case 'standard':
      default:
        deliveryDays = 3;
        break;
    }

    const deliveryDate = new Date(now);
    deliveryDate.setDate(now.getDate() + deliveryDays);
    
    return deliveryDate.toISOString().split('T')[0];
  }
}

// モック機能を追加
function generateMockFedExResponse(item: any, service: string): {
  trackingNumber: string;
  labelData: string;
  cost: number;
  currency: string;
  estimatedDelivery: string;
} {
  // モック配送ラベルの生成
  const mockTrackingNumber = `FX${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
  
  // 有効なPDFの最小構造を生成
  function createValidPDF(): string {
    // 実際に動作する最小限のPDF
    const pdfContent = [
      '%PDF-1.3',
      '1 0 obj',
      '<<',
      '/Type /Catalog',
      '/Outlines 2 0 R',
      '/Pages 3 0 R',
      '>>',
      'endobj',
      '2 0 obj',
      '<<',
      '/Type /Outlines',
      '/Count 0',
      '>>',
      'endobj',
      '3 0 obj',
      '<<',
      '/Type /Pages',
      '/Count 1',
      '/Kids [4 0 R]',
      '>>',
      'endobj',
      '4 0 obj',
      '<<',
      '/Type /Page',
      '/Parent 3 0 R',
      '/Resources <<',
      '/Font <<',
      '/F1 9 0 R',
      '>>',
      '>>',
      '/MediaBox [0 0 612 792]',
      '/Contents 8 0 R',
      '>>',
      'endobj',
      '8 0 obj',
      '<<',
      '/Length 500',
      '>>',
      'stream',
      'BT',
      '/F1 20 Tf',
      '100 700 Td',
      '(FedEx Mock Label) Tj',
      '0 -50 Td',
      '/F1 14 Tf',
      `(Tracking: ${mockTrackingNumber}) Tj`,
      '0 -30 Td',
      `(Order: ${item.orderNumber || 'N/A'}) Tj`,
      '0 -25 Td',
      `(Product: ${(item.productName || 'N/A').substring(0, 30)}) Tj`,
      '0 -25 Td',
      `(Customer: ${(item.customer || 'N/A').substring(0, 30)}) Tj`,
      '0 -25 Td',
      `(Service: ${service}) Tj`,
      '0 -50 Td',
      '(Mock Shipping Label) Tj',
      'ET',
      'endstream',
      'endobj',
      '9 0 obj',
      '<<',
      '/Type /Font',
      '/Subtype /Type1',
      '/Name /F1',
      '/BaseFont /Helvetica',
      '/Encoding /MacRomanEncoding',
      '>>',
      'endobj',
      'xref',
      '0 10',
      '0000000000 65535 f',
      '0000000021 00000 n',
      '0000000079 00000 n',
      '0000000126 00000 n',
      '0000000183 00000 n',
      '0000000000 65535 f',
      '0000000000 65535 f',
      '0000000000 65535 f',
      '0000000348 00000 n',
      '0000000565 00000 n',
      'trailer',
      '<<',
      '/Size 10',
      '/Root 1 0 R',
      '>>',
      'startxref',
      '678',
      '%%EOF'
    ].join('\n');
    
    return pdfContent;
  }

  const mockLabelData = Buffer.from(createValidPDF()).toString('base64');

  const serviceCosts: Record<string, number> = {
    standard: 800,
    express: 1200,
    priority: 1800
  };

  const deliveryDays: Record<string, number> = {
    standard: 3,
    express: 2,
    priority: 1
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (deliveryDays[service] || 3));

  return {
    trackingNumber: mockTrackingNumber,
    labelData: mockLabelData,
    cost: serviceCosts[service] || 800,
    currency: 'JPY',
    estimatedDelivery: deliveryDate.toISOString().split('T')[0]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { item, service } = await request.json();

    console.log('FedEx API呼び出し開始:', { item: item?.orderNumber, service });

    if (!item) {
      console.error('商品情報が不足しています');
      return NextResponse.json(
        { error: '商品情報が必要です' },
        { status: 400 }
      );
    }

    // 環境変数をチェック
    const hasRequiredEnvVars = !!(
      process.env.FEDEX_API_KEY && 
      process.env.FEDEX_SECRET_KEY && 
      process.env.FEDEX_ACCOUNT_NUMBER && 
      process.env.FEDEX_METER_NUMBER
    );

    console.log('環境変数チェック:', { hasRequiredEnvVars });

    if (!hasRequiredEnvVars) {
      console.warn('FedEx環境変数が設定されていません。モック機能を使用します。');
      const mockResult = generateMockFedExResponse(item, service);
      console.log('モック配送ラベル生成完了:', mockResult.trackingNumber);
      return NextResponse.json({
        ...mockResult,
        isMock: true,
        message: 'モック配送ラベルが生成されました（開発用）'
      });
    }

    try {
      console.log('FedEx API呼び出し試行中...');
      const fedexAdapter = new FedExServerAdapter();
      const result = await fedexAdapter.generateShippingLabel(item, service);
      console.log('FedEx API呼び出し成功:', result.trackingNumber);
      return NextResponse.json(result);
    } catch (apiError) {
      console.error('FedEx API エラー、モックにフォールバック:', apiError);
      const mockResult = generateMockFedExResponse(item, service);
      console.log('フォールバックでモック配送ラベル生成:', mockResult.trackingNumber);
      return NextResponse.json({
        ...mockResult,
        isMock: true,
        message: 'FedEx APIに接続できません。モック配送ラベルを生成しました。'
      });
    }

  } catch (error) {
    console.error('FedEx API 処理エラー:', error);
    return NextResponse.json(
      { 
        error: 'FedEx配送ラベルの生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}