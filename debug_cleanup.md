# デバッグコード削除手順

ページネーション修正のために追加したデバッグコードを削除するための手順書です。

## 削除対象ファイルと箇所

### 1. app/staff/inventory/page.tsx

**削除する箇所（328-338行目付近）:**
```typescript
    // ===== DEBUG START - 修正完了後削除予定 =====
    console.log('🔍 PAGINATION DEBUG:', {
      filteredItemsLength: filteredItems.length,
      currentPage,
      itemsPerPage,
      totalPages: Math.ceil(filteredItems.length / itemsPerPage),
      startIndex,
      endIndex,
      paginatedItemsLength: filteredItems.slice(startIndex, endIndex).length
    });
    // ===== DEBUG END =====
```

**削除する箇所（670-676行目付近）:**
```typescript
                {/* ===== DEBUG START - 修正完了後削除予定 ===== */}
                {console.log('🗺️ PAGINATION RENDER CHECK:', {
                  loading,
                  filteredItemsLength: filteredItems.length,
                  totalPages: Math.ceil(filteredItems.length / itemsPerPage),
                  shouldRenderPagination: !loading
                })}
                {/* ===== DEBUG END ===== */}
```

### 2. app/components/ui/Pagination.tsx

**削除する箇所（58-67行目付近）:**
```typescript
  // ===== DEBUG START - 修正完了後削除予定 =====
  console.log('📄 PAGINATION COMPONENT:', {
    totalPages,
    totalItems,
    itemsPerPage,
    currentPage,
    startItem,
    endItem,
    shouldShow: totalPages > 1
  });
  // ===== DEBUG END =====
```

**元に戻す箇所（69行目付近）:**
```typescript
  // 元の条件に戻す
  // if (totalItems === 0) return null; を削除
  // if (totalPages <= 1) return null; に戻す
```

## 自動削除コマンド

Windows PowerShell用のデバッグコード削除スクリプト:

```powershell
# 在庫管理画面のデバッグログ削除
(Get-Content "app\staff\inventory\page.tsx") | 
Where-Object { $_ -notmatch "===== DEBUG START|===== DEBUG END|console\.log.*PAGINATION DEBUG|console\.log.*PAGINATION RENDER CHECK" } | 
Set-Content "app\staff\inventory\page.tsx"

# Paginationコンポーネントのデバッグログ削除
(Get-Content "app\components\ui\Pagination.tsx") | 
Where-Object { $_ -notmatch "===== DEBUG START|===== DEBUG END|console\.log.*PAGINATION COMPONENT" } | 
Set-Content "app\components\ui\Pagination.tsx"

# 表示条件を元に戻す
(Get-Content "app\components\ui\Pagination.tsx") | 
ForEach-Object { $_ -replace "if \(totalItems === 0\) return null;", "if (totalPages <= 1) return null;" } | 
Set-Content "app\components\ui\Pagination.tsx"
```

## 手動削除手順

1. 各ファイルを開く
2. 「===== DEBUG START」から「===== DEBUG END」までの行を削除
3. `console.log` 行を削除  
4. `Pagination.tsx` の表示条件を元に戻す

修正が正常に動作することを確認してから実行してください。























