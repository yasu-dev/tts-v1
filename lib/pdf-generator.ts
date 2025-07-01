import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * PDF生成ユーティリティ
 */
export class PDFGenerator {
  /**
   * バーコードラベルPDF生成（A4サイズ 6面付け）
   */
  static async generateBarcodeLabels(labels: BarcodeLabel[]): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4: 210mm x 297mm
    // 6面付け（2列 x 3行）
    const labelWidth = 95;
    const labelHeight = 90;
    const marginX = 10;
    const marginY = 13.5;
    const spacing = 5;

    let currentPage = 0;
    let position = 0;

    labels.forEach((label, index) => {
      // 新しいページが必要な場合
      if (position === 0 && index > 0) {
        pdf.addPage();
      }

      // 位置計算
      const col = position % 2;
      const row = Math.floor(position / 2);
      const x = marginX + col * (labelWidth + spacing);
      const y = marginY + row * (labelHeight + spacing);

      // ラベル枠線
      pdf.setDrawColor(200);
      pdf.rect(x, y, labelWidth, labelHeight);

      // タイトル
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('THE WORLD DOOR', x + labelWidth / 2, y + 10, { align: 'center' });

      // SKU
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`SKU: ${label.sku}`, x + 5, y + 20);

      // バーコード（模擬的な表現）
      pdf.setFillColor(0);
      const barcodeY = y + 30;
      const barcodeHeight = 20;
      const barcodeWidth = labelWidth - 20;
      
      // バーコードパターンをシミュレート
      for (let i = 0; i < barcodeWidth; i += 2) {
        if (Math.random() > 0.3) {
          pdf.rect(x + 10 + i, barcodeY, 1, barcodeHeight, 'F');
        }
      }

      // バーコード番号
      pdf.setFontSize(10);
      pdf.text(label.barcode, x + labelWidth / 2, barcodeY + barcodeHeight + 5, { align: 'center' });

      // 商品名
      pdf.setFontSize(11);
      const productNameLines = pdf.splitTextToSize(label.productName, labelWidth - 10);
      pdf.text(productNameLines, x + 5, y + 65);

      // 価格
      if (label.price) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`¥${label.price.toLocaleString()}`, x + labelWidth - 5, y + 80, { align: 'right' });
      }

      position++;
      if (position === 6) {
        position = 0;
      }
    });

    return pdf.output('blob');
  }

  /**
   * 納品書PDF生成
   */
  static async generateDeliveryNote(data: DeliveryNoteData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ヘッダー
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('納品書', 105, 20, { align: 'center' });

    // 日付
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`発行日: ${new Date().toLocaleDateString('ja-JP')}`, 170, 20);
    pdf.text(`納品書番号: ${data.deliveryId}`, 170, 25);

    // 会社情報
    pdf.setFontSize(12);
    pdf.text('THE WORLD DOOR', 20, 40);
    pdf.setFontSize(10);
    pdf.text('〒100-0001 東京都千代田区千代田1-1-1', 20, 46);
    pdf.text('TEL: 03-1234-5678', 20, 52);

    // 納品先情報
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('納品先:', 20, 65);
    pdf.setFont('helvetica', 'normal');
    pdf.text(data.deliveryTo.name, 20, 72);
    pdf.setFontSize(10);
    const addressLines = pdf.splitTextToSize(data.deliveryTo.address, 100);
    pdf.text(addressLines, 20, 78);

    // 商品テーブル
    const startY = 100;
    const headers = ['No.', 'SKU', '商品名', '数量', '単価', '金額'];
    const columnWidths = [15, 30, 70, 20, 25, 25];
    
    // ヘッダー行
    pdf.setFillColor(240, 240, 240);
    pdf.rect(20, startY, 170, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    
    let currentX = 20;
    headers.forEach((header, index) => {
      pdf.text(header, currentX + columnWidths[index] / 2, startY + 5, { align: 'center' });
      currentX += columnWidths[index];
    });

    // データ行
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 10;
    let subtotal = 0;

    data.items.forEach((item, index) => {
      currentX = 20;
      const amount = item.quantity * item.unitPrice;
      subtotal += amount;

      pdf.text((index + 1).toString(), currentX + columnWidths[0] / 2, currentY + 5, { align: 'center' });
      currentX += columnWidths[0];

      pdf.text(item.sku, currentX + 2, currentY + 5);
      currentX += columnWidths[1];

      const productNameLines = pdf.splitTextToSize(item.productName, columnWidths[2] - 4);
      pdf.text(productNameLines[0], currentX + 2, currentY + 5);
      currentX += columnWidths[2];

      pdf.text(item.quantity.toString(), currentX + columnWidths[3] / 2, currentY + 5, { align: 'center' });
      currentX += columnWidths[3];

      pdf.text(`¥${item.unitPrice.toLocaleString()}`, currentX + columnWidths[4] - 2, currentY + 5, { align: 'right' });
      currentX += columnWidths[4];

      pdf.text(`¥${amount.toLocaleString()}`, currentX + columnWidths[5] - 2, currentY + 5, { align: 'right' });

      // 罫線
      pdf.setDrawColor(200);
      pdf.line(20, currentY + 8, 190, currentY + 8);
      
      currentY += 10;
    });

    // 合計
    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('小計:', 140, currentY);
    pdf.text(`¥${subtotal.toLocaleString()}`, 185, currentY, { align: 'right' });

    const tax = Math.floor(subtotal * 0.1);
    const total = subtotal + tax;

    currentY += 6;
    pdf.text('消費税(10%):', 140, currentY);
    pdf.text(`¥${tax.toLocaleString()}`, 185, currentY, { align: 'right' });

    currentY += 6;
    pdf.setFontSize(12);
    pdf.text('合計金額:', 140, currentY);
    pdf.text(`¥${total.toLocaleString()}`, 185, currentY, { align: 'right' });

    // フッター
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.text('備考: ' + (data.notes || 'なし'), 20, 260);

    return pdf.output('blob');
  }

  /**
   * ピッキングリストPDF生成
   */
  static async generatePickingList(data: PickingListData): Promise<Blob> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ヘッダー
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('ピッキングリスト', 105, 15, { align: 'center' });

    // 基本情報
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`作成日時: ${new Date().toLocaleString('ja-JP')}`, 15, 25);
    pdf.text(`リスト番号: ${data.listId}`, 15, 30);
    pdf.text(`作業者: ${data.assignedTo || '未割当'}`, 15, 35);
    pdf.text(`優先度: ${data.priority || '通常'}`, 150, 30);

    // 商品リスト
    const startY = 45;
    const headers = ['□', 'ロケーション', 'SKU', '商品名', '数量', 'ステータス'];
    const columnWidths = [10, 30, 30, 70, 20, 25];

    // ヘッダー行
    pdf.setFillColor(230, 230, 230);
    pdf.rect(15, startY, 180, 8, 'F');
    pdf.setFont('helvetica', 'bold');
    
    let currentX = 15;
    headers.forEach((header, index) => {
      if (header === '□') {
        // チェックボックス
        pdf.rect(currentX + 3, startY + 2, 4, 4);
      } else {
        pdf.text(header, currentX + 2, startY + 5);
      }
      currentX += columnWidths[index];
    });

    // データ行
    pdf.setFont('helvetica', 'normal');
    let currentY = startY + 10;

    data.items.forEach((item) => {
      currentX = 15;

      // チェックボックス
      pdf.rect(currentX + 3, currentY + 1, 4, 4);
      currentX += columnWidths[0];

      // ロケーション（強調表示）
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(11);
      pdf.text(item.location, currentX + 2, currentY + 5);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      currentX += columnWidths[1];

      // SKU
      pdf.text(item.sku, currentX + 2, currentY + 5);
      currentX += columnWidths[2];

      // 商品名（長い場合は省略）
      const productName = item.productName.length > 40 
        ? item.productName.substring(0, 37) + '...' 
        : item.productName;
      pdf.text(productName, currentX + 2, currentY + 5);
      currentX += columnWidths[3];

      // 数量
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.quantity.toString(), currentX + columnWidths[4] / 2, currentY + 5, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      currentX += columnWidths[4];

      // ステータス
      const statusText = item.isPicked ? '✓ 完了' : '未完了';
      if (item.isPicked) {
        pdf.setTextColor(0, 150, 0);
      }
      pdf.text(statusText, currentX + 2, currentY + 5);
      pdf.setTextColor(0);

      // 罫線
      pdf.setDrawColor(200);
      pdf.line(15, currentY + 8, 195, currentY + 8);
      
      currentY += 10;

      // ページブレイク
      if (currentY > 270) {
        pdf.addPage();
        currentY = 20;
      }
    });

    // サマリー
    currentY += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`合計アイテム数: ${data.items.length}`, 15, currentY);
    
    const pickedCount = data.items.filter(item => item.isPicked).length;
    pdf.text(`完了: ${pickedCount} / ${data.items.length}`, 15, currentY + 6);

    // QRコード領域（実際の実装では本物のQRコードを生成）
    if (data.qrCode) {
      pdf.rect(150, currentY - 5, 30, 30);
      pdf.setFontSize(8);
      pdf.text('QRコード', 165, currentY + 20, { align: 'center' });
    }

    return pdf.output('blob');
  }

  /**
   * HTMLエレメントからPDF生成
   */
  static async generateFromHTML(elementId: string, fileName: string = 'document.pdf'): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error('指定されたエレメントが見つかりません');
    }

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 10;

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(fileName);
  }
}

// 型定義
interface BarcodeLabel {
  sku: string;
  barcode: string;
  productName: string;
  price?: number;
}

interface DeliveryNoteData {
  deliveryId: string;
  deliveryTo: {
    name: string;
    address: string;
  };
  items: Array<{
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  notes?: string;
}

interface PickingListData {
  listId: string;
  assignedTo?: string;
  priority?: 'high' | 'medium' | 'low';
  items: Array<{
    location: string;
    sku: string;
    productName: string;
    quantity: number;
    isPicked: boolean;
  }>;
  qrCode?: string;
} 