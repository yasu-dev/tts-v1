SELECT
  p.id as product_id,
  p.name as product_name,
  p.status as product_status,
  s.id as shipment_id,
  s.trackingNumber,
  s.notes,
  s.bundleId
FROM Product p
LEFT JOIN Shipment s ON p.id = s.productId
WHERE p.name LIKE '%TESTカメラ%'
ORDER BY p.name;