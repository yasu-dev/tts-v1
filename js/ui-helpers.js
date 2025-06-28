/**
 * UI Helper Functions for THE WORLD DOOR Fulfillment System
 * UIコンポーネントの生成とデータバインディングを担当
 */

class UIHelpers {
    /**
     * 数値を日本語通貨形式でフォーマット
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('ja-JP', {
            style: 'currency',
            currency: 'JPY'
        }).format(amount);
    }

    /**
     * 日付を日本語形式でフォーマット
     */
    static formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP');
    }

    /**
     * 日時を日本語形式でフォーマット
     */
    static formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('ja-JP');
    }

    /**
     * 相対時間を計算（○分前、○時間前など）
     */
    static formatRelativeTime(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diffMs = now - past;
        
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMinutes < 60) {
            return `${diffMinutes}分前`;
        } else if (diffHours < 24) {
            return `${diffHours}時間前`;
        } else {
            return `${diffDays}日前`;
        }
    }

    /**
     * サマリーカードを生成
     */
    static createSummaryCard(label, value, change = null) {
        const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : '';
        const changeText = change ? `↗ 前月比 +${change}%` : '';
        
        return `
            <div class="summary-card">
                <div class="summary-label">${label}</div>
                <div class="summary-value">${value}</div>
                ${change ? `<div class="summary-change ${changeClass}">${changeText}</div>` : ''}
            </div>
        `;
    }

    /**
     * ステータスアイテムを生成
     */
    static createStatusItem(count, label) {
        return `
            <div class="status-item" onclick="filterByStatus('${label}')">
                <span class="status-count">${count}</span>
                <div class="status-label">${label}</div>
            </div>
        `;
    }

    /**
     * アラートアイテムを生成
     */
    static createAlertItem(alert) {
        return `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">${alert.icon}</div>
                <div>
                    <strong>${alert.title}</strong><br>
                    ${alert.description}
                </div>
            </div>
        `;
    }

    /**
     * 最近の活動アイテムを生成
     */
    static createActivityItem(activity) {
        return `
            <div style="padding: 1rem; border-left: 3px solid ${activity.color}; background: ${this.getActivityBackground(activity.color)}; margin: 0.5rem 0;">
                <strong>${activity.title}</strong> - ${activity.description}
                <span style="color: #666; float: right;">${this.formatRelativeTime(activity.timestamp)}</span>
            </div>
        `;
    }

    /**
     * 活動の背景色を取得
     */
    static getActivityBackground(color) {
        const backgroundMap = {
            '#4CAF50': '#f8fff8',
            '#2196F3': '#f0f8ff',
            '#FF9800': '#fff8f0'
        };
        return backgroundMap[color] || '#f8f9fa';
    }

    /**
     * 商品カードを生成
     */
    static createProductCard(product) {
        const actions = product.actions.map(action => {
            const actionLabels = {
                'detail': '詳細',
                'list': '出品',
                'editPrice': '価格変更'
            };
            const actionClass = action === 'detail' ? 'btn-primary' : 'btn-outline';
            const disabled = product.status === 'inbound' || product.status === 'inspection' ? 'disabled' : '';
            
            return `<button class="btn ${actionClass} btn-sm" onclick="handleProductAction('${action}', '${product.id}')" ${disabled}>${actionLabels[action]}</button>`;
        }).join('');

        const statusClass = `status-${product.status}`;
        const locationText = product.location || '-';
        const dateLabel = product.status === 'sold' ? '売却日' : '入庫日';
        const dateValue = product.status === 'sold' ? product.soldDate : product.inboundDate;
        const priceLabel = product.status === 'sold' ? '販売額' : '価格';
        const priceValue = product.status === 'sold' ? product.soldPrice : product.price;

        return `
            <div class="product-card">
                <div class="product-image">${product.image}</div>
                <div class="product-info">
                    <div class="product-sku">SKU: ${product.sku}</div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.categoryLabel}</div>
                    
                    <div class="product-details">
                        <div class="detail-item">
                            <span class="detail-label">${priceLabel}:</span>
                            <span class="detail-value">${this.formatCurrency(priceValue)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">保管場所:</span>
                            <span class="detail-value">${locationText}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">${dateLabel}:</span>
                            <span class="detail-value">${this.formatDate(dateValue)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">日数:</span>
                            <span class="detail-value">${product.daysInStorage}日</span>
                        </div>
                    </div>
                    
                    <div class="product-status ${statusClass}">${product.statusLabel}</div>
                    
                    <div class="product-actions">
                        ${actions}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * タスクアイテムを生成
     */
    static createTaskItem(task, isUrgent = false) {
        const priorityClass = `priority-${task.priority}`;
        const metaItems = task.itemCount 
            ? [
                `📦 ${task.itemCount}件`,
                `⏰ ${task.deadline}`,
                `📍 ${task.location}`
              ]
            : [
                `📍 ${task.location}`,
                `⏰ ${task.duration}`,
                task.value ? `💰 ${task.value}` : `🔄 ${task.value}`
              ];

        const actionButton = isUrgent 
            ? `<button class="btn btn-primary" onclick="startTask('${task.id}')">開始</button>`
            : task.type === 'shipping'
                ? `<button class="btn btn-success" onclick="startBatch('${task.batchId}')">開始</button>`
                : `<button class="btn btn-primary" onclick="startBatch('${task.batchId}')">開始</button>`;

        const viewButton = task.batchId ? `<button class="btn btn-outline" onclick="viewBatch('${task.batchId}')">一覧</button>` : '';

        return `
            <div class="task-item" ${isUrgent ? `onclick="openTaskModal('${task.id}')"` : ''} data-category="${task.type}">
                <div class="task-priority ${priorityClass}"></div>
                <div class="task-content">
                    <div class="task-name">${task.name}</div>
                    <div class="task-description">${task.description}</div>
                    <div class="task-meta">
                        ${metaItems.map(item => `<span>${item}</span>`).join('')}
                    </div>
                </div>
                <div class="task-actions">
                    ${viewButton}
                    ${actionButton}
                </div>
            </div>
        `;
    }

    /**
     * タイムラインアイテムを生成
     */
    static createTimelineItem(item) {
        const metaItems = item.meta.map(meta => 
            `<div class="meta-item">${meta.icon} ${meta.text}</div>`
        ).join('');

        return `
            <div class="timeline-item" data-type="${item.type}">
                <div class="timeline-icon ${item.iconClass}">${item.icon}</div>
                <div class="timeline-content">
                    <div class="timeline-date">${item.date}</div>
                    <div class="timeline-title-text">${item.title}</div>
                    <div class="timeline-description">${item.description}</div>
                    <div class="timeline-meta">${metaItems}</div>
                </div>
            </div>
        `;
    }

    /**
     * 予測カードを生成
     */
    static createPredictionCard(prediction) {
        return `
            <div class="prediction-card">
                <div class="prediction-label">${prediction.label}</div>
                <div class="prediction-value">${prediction.value}</div>
                <div class="prediction-note">${prediction.note}</div>
            </div>
        `;
    }

    /**
     * セレクトオプションを生成
     */
    static createSelectOptions(items) {
        return items.map(item => 
            `<option value="${item.value}">${item.label}</option>`
        ).join('');
    }

    /**
     * 最近の活動アイテムを生成（タスク画面用）
     */
    static createTaskActivityItem(activity) {
        return `
            <div class="activity-item">
                <div class="activity-icon ${activity.color}">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.timestamp}</div>
                </div>
            </div>
        `;
    }

    /**
     * ローディング表示を作成
     */
    static createLoadingSpinner() {
        return `
            <div style="display: flex; justify-content: center; align-items: center; padding: 2rem;">
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid #667eea; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
            </div>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
    }

    /**
     * エラーメッセージを作成
     */
    static createErrorMessage(message) {
        return `
            <div style="padding: 1rem; background: #f8d7da; color: #721c24; border-radius: 6px; margin: 1rem 0;">
                <strong>エラー:</strong> ${message}
            </div>
        `;
    }

    /**
     * 成功メッセージを作成
     */
    static createSuccessMessage(message) {
        return `
            <div style="padding: 1rem; background: #d4edda; color: #155724; border-radius: 6px; margin: 1rem 0;">
                <strong>成功:</strong> ${message}
            </div>
        `;
    }
}

// グローバルスコープで利用可能にする
window.UIHelpers = UIHelpers;