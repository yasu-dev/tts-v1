import { NextRequest, NextResponse } from 'next/server';

interface FedXConfig {
  apiKey: string;
  secretKey: string;
  accountNumber: string;
  meterNumber: string;
  baseUrl: string;
  environment: 'sandbox' | 'production';
}

interface FedXAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
}

interface FedXShipmentRequest {
  accountNumber: string;
  serviceType: string;
  packagingType: string;
  shipper: {
    contact: {
      personName: string;
      emailAddress: string;
      phoneNumber: string;
    };
    address: FedXAddress;
  };
  recipients: Array<{
    contact: {
      personName: string;
      emailAddress?: string;
      phoneNumber?: string;
    };
    address: FedXAddress;
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

class FedXServerAdapter {
  private config: FedXConfig;
  private authToken?: string;
  private tokenExpiry?: Date;

  constructor() {
    this.config = {
      apiKey: process.env.FEDX_API_KEY || '',
      secretKey: process.env.FEDX_SECRET_KEY || '',
      accountNumber: process.env.FEDX_ACCOUNT_NUMBER || '',
      meterNumber: process.env.FEDX_METER_NUMBER || '',
      baseUrl: process.env.FEDX_BASE_URL || 'https://apis-sandbox.fedx.com',
      environment: (process.env.FEDX_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox'
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
      throw new Error(`FedX認証エラー: ${response.status} - ${errorText}`);
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
        standard: 'FEDX_GROUND',
        express: 'FEDX_EXPRESS_SAVER',
        priority: 'PRIORITY_OVERNIGHT'
      };

      const shippingAddress = this.parseAddress(item.shippingAddress);
      
      const shipmentRequest: FedXShipmentRequest = {
        accountNumber: this.config.accountNumber,
        serviceType: serviceTypeMap[service] || 'FEDX_GROUND',
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
        throw new Error(`FedX配送ラベル生成エラー: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(`FedX APIエラー: ${result.errors.map((e: any) => e.message).join(', ')}`);
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
      console.error('FedX配送ラベル生成エラー:', error);
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

// モック配送ラベルPDFを生成（シンプル版）
function generateMockFedXResponse(item: any, service: string): {
  trackingNumber: string;
  labelData: string;
  cost: number;
  currency: string;
  estimatedDelivery: string;
} {
  const mockTrackingNumber = `FX${Math.random().toString(36).substr(2, 10).toUpperCase()}`;
  
  // 最小限の有効なPDF（確実に動作する）
  const validPdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 400 >>
stream
BT
/F1 16 Tf
50 750 Td
(FedX Mock Shipping Label) Tj
0 -30 Td
/F1 12 Tf
(Tracking: ${mockTrackingNumber}) Tj
0 -20 Td
(Order: ${item.orderNumber || 'N/A'}) Tj
0 -20 Td
(Product: ${(item.productName || 'N/A').replace(/[()]/g, '')}) Tj
0 -20 Td
(Customer: ${(item.customer || 'N/A').replace(/[()]/g, '')}) Tj
0 -20 Td
(Service: ${service}) Tj
0 -20 Td
(Date: ${new Date().toLocaleDateString('ja-JP')}) Tj
0 -40 Td
(Mock Shipping Label) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000066 00000 n 
0000000123 00000 n 
0000000244 00000 n 
0000000695 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
765
%%EOF`;

  const labelData = Buffer.from(validPdfContent).toString('base64');

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
    labelData: labelData,
    cost: serviceCosts[service] || 800,
    currency: 'JPY',
    estimatedDelivery: deliveryDate.toISOString().split('T')[0]
  };
}

export async function POST(request: NextRequest) {
  try {
    const { item, service } = await request.json();

    console.log('FedX API呼び出し開始:', { item: item?.orderNumber, service });

    if (!item) {
      console.error('商品情報が不足しています');
      return NextResponse.json(
        { error: '商品情報が必要です' },
        { status: 400 }
      );
    }

    // 環境変数をチェック
    const hasRequiredEnvVars = !!(
      process.env.FEDX_API_KEY && 
      process.env.FEDX_SECRET_KEY && 
      process.env.FEDX_ACCOUNT_NUMBER && 
      process.env.FEDX_METER_NUMBER
    );

    console.log('環境変数チェック:', { hasRequiredEnvVars });

    if (!hasRequiredEnvVars) {
      console.warn('FedX環境変数が設定されていません。モック機能を使用します。');
      const mockResult = generateMockFedXResponse(item, service);
      console.log('モック配送ラベル生成完了:', mockResult.trackingNumber);
      return NextResponse.json({
        ...mockResult,
        isMock: true,
        message: 'モック配送ラベルが生成されました（開発用）'
      });
    }

    try {
      console.log('FedX API呼び出し試行中...');
      const fedxAdapter = new FedXServerAdapter();
      const result = await fedxAdapter.generateShippingLabel(item, service);
      console.log('FedX API呼び出し成功:', result.trackingNumber);
      return NextResponse.json(result);
    } catch (apiError) {
      console.error('FedX API エラー、モックにフォールバック:', apiError);
      const mockResult = generateMockFedXResponse(item, service);
      console.log('フォールバックでモック配送ラベル生成:', mockResult.trackingNumber);
      return NextResponse.json({
        ...mockResult,
        isMock: true,
        message: 'FedX APIに接続できません。モック配送ラベルを生成しました。'
      });
    }

  } catch (error) {
    console.error('FedX API 処理エラー:', error);
    return NextResponse.json(
      { 
        error: 'FedX配送ラベルの生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    );
  }
}