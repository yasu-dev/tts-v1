/**
 * API Layer for THE WORLD DOOR Fulfillment System
 * データの取得・更新・操作を担当
 */

class APIClient {
    constructor() {
        this.baseURL = './data';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5分間キャッシュ
    }

    /**
     * JSONファイルからデータを取得
     */
    async fetchData(endpoint) {
        const cacheKey = endpoint;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        try {
            const response = await fetch(`${this.baseURL}/${endpoint}.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // キャッシュに保存
            this.cache.set(cacheKey, {
                data: data,
                timestamp: Date.now()
            });
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            throw error;
        }
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * 特定のキャッシュを削除
     */
    clearCacheFor(endpoint) {
        this.cache.delete(endpoint);
    }

    // ===========================================
    // ダッシュボード関連のAPI
    // ===========================================

    /**
     * ダッシュボードデータを取得
     */
    async getDashboardData() {
        return await this.fetchData('dashboard');
    }

    /**
     * サマリー情報のみ取得
     */
    async getSummary() {
        const data = await this.getDashboardData();
        return data.summary;
    }

    /**
     * ステータスサマリーを取得
     */
    async getStatusSummary() {
        const data = await this.getDashboardData();
        return data.statusSummary;
    }

    /**
     * アラート一覧を取得
     */
    async getAlerts() {
        const data = await this.getDashboardData();
        return data.alerts;
    }

    /**
     * 最近の活動を取得
     */
    async getRecentActivities() {
        const data = await this.getDashboardData();
        return data.recentActivities;
    }

    // ===========================================
    // 在庫管理関連のAPI
    // ===========================================

    /**
     * 在庫データを取得
     */
    async getInventoryData() {
        return await this.fetchData('inventory');
    }

    /**
     * 商品一覧を取得
     */
    async getProducts(filters = {}) {
        const data = await this.getInventoryData();
        let products = data.products;

        // フィルタリング
        if (filters.status && filters.status !== '') {
            products = products.filter(product => product.status === filters.status);
        }
        if (filters.category && filters.category !== '') {
            products = products.filter(product => product.category === filters.category);
        }
        if (filters.location && filters.location !== '') {
            products = products.filter(product => product.location.startsWith(filters.location));
        }
        if (filters.search && filters.search !== '') {
            const searchTerm = filters.search.toLowerCase();
            products = products.filter(product => 
                product.name.toLowerCase().includes(searchTerm) ||
                product.sku.toLowerCase().includes(searchTerm)
            );
        }

        return products;
    }

    /**
     * 特定の商品情報を取得
     */
    async getProduct(productId) {
        const data = await this.getInventoryData();
        return data.products.find(product => product.id === productId);
    }

    /**
     * カテゴリー一覧を取得
     */
    async getCategories() {
        const data = await this.getInventoryData();
        return data.categories;
    }

    /**
     * ステータス一覧を取得
     */
    async getStatuses() {
        const data = await this.getInventoryData();
        return data.statuses;
    }

    /**
     * ロケーション一覧を取得
     */
    async getLocations() {
        const data = await this.getInventoryData();
        return data.locations;
    }

    // ===========================================
    // タスク管理関連のAPI
    // ===========================================

    /**
     * タスクデータを取得
     */
    async getTasksData() {
        return await this.fetchData('tasks');
    }

    /**
     * 緊急タスクを取得
     */
    async getUrgentTasks() {
        const data = await this.getTasksData();
        return data.urgentTasks;
    }

    /**
     * 通常タスクを取得
     */
    async getNormalTasks(filter = 'all') {
        const data = await this.getTasksData();
        let tasks = data.normalTasks;

        if (filter !== 'all') {
            tasks = tasks.filter(task => task.type === filter);
        }

        return tasks;
    }

    /**
     * 進捗情報を取得
     */
    async getProgress() {
        const data = await this.getTasksData();
        return data.progress;
    }

    /**
     * クイックアクション一覧を取得
     */
    async getQuickActions() {
        const data = await this.getTasksData();
        return data.quickActions;
    }

    /**
     * 最近の活動を取得（タスク画面用）
     */
    async getTaskRecentActivity() {
        const data = await this.getTasksData();
        return data.recentActivity;
    }

    // ===========================================
    // タイムライン関連のAPI
    // ===========================================

    /**
     * タイムラインデータを取得
     */
    async getTimelineData() {
        return await this.fetchData('timeline');
    }

    /**
     * 商品情報を取得
     */
    async getTimelineProduct() {
        const data = await this.getTimelineData();
        return data.product;
    }

    /**
     * タイムライン履歴を取得
     */
    async getTimeline(filter = 'all') {
        const data = await this.getTimelineData();
        let timeline = data.timeline;

        if (filter !== 'all') {
            timeline = timeline.filter(item => item.type === filter);
        }

        return timeline;
    }

    /**
     * 予測情報を取得
     */
    async getPredictions() {
        const data = await this.getTimelineData();
        return data.predictions;
    }

    // ===========================================
    // データ更新関連のAPI（モック）
    // ===========================================

    /**
     * 商品価格を更新（モック）
     */
    async updateProductPrice(productId, newPrice) {
        // 実際の実装では、サーバーにPUTリクエストを送信
        console.log(`Updating price for ${productId} to ${newPrice}`);
        
        // キャッシュをクリアして最新データを取得するようにする
        this.clearCacheFor('inventory');
        
        return {
            success: true,
            message: '価格が更新されました',
            productId: productId,
            newPrice: newPrice
        };
    }

    /**
     * タスクを完了にする（モック）
     */
    async completeTask(taskId) {
        console.log(`Completing task: ${taskId}`);
        
        this.clearCacheFor('tasks');
        
        return {
            success: true,
            message: 'タスクが完了しました',
            taskId: taskId
        };
    }

    /**
     * 在庫データをエクスポート（モック）
     */
    async exportInventory(format = 'csv') {
        const products = await this.getProducts();
        
        if (format === 'csv') {
            const csvData = this.convertToCSV(products);
            this.downloadFile(csvData, 'inventory.csv', 'text/csv');
        }
        
        return {
            success: true,
            message: `在庫データを${format.toUpperCase()}形式でエクスポートしました`
        };
    }

    /**
     * 配列をCSV形式に変換
     */
    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvHeaders = headers.join(',');
        
        const csvRows = data.map(row => 
            headers.map(header => {
                const value = row[header];
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value}"` 
                    : value;
            }).join(',')
        );
        
        return [csvHeaders, ...csvRows].join('\\n');
    }

    /**
     * ファイルをダウンロード
     */
    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
    }
}

// グローバルAPIインスタンスを作成
const api = new APIClient();

// デバッグ用にグローバルスコープで利用可能にする
window.api = api;