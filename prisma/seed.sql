-- EmotionTagのデータ
INSERT INTO "EmotionTag" (id, name) VALUES
('clh1234567890', '怒り'),
('clh1234567891', '悲しみ'),
('clh1234567892', '不安'),
('clh1234567893', '喜び'),
('clh1234567894', '落ち込み');

-- Postのデータ
INSERT INTO "Post" (id, content, "createdAt", "emotionTagId", "ipAddress") VALUES
('clp1234567890', '今日はとても疲れた一日だった...', NOW(), 'clh1234567892', '127.0.0.1'),
('clp1234567891', '新しい仕事が決まって嬉しい！', NOW(), 'clh1234567893', '127.0.0.1'),
('clp1234567892', '人間関係に悩んでいる', NOW(), 'clh1234567891', '127.0.0.1'),
('clp1234567893', '最近のニュースにイライラする', NOW(), 'clh1234567890', '127.0.0.1'),
('clp1234567894', '明日から頑張ろう', NOW(), 'clh1234567894', '127.0.0.1');

-- Empathyのデータ
INSERT INTO "Empathy" (id, "postId", "createdAt") VALUES
('cle1234567890', 'clp1234567890', NOW()),
('cle1234567891', 'clp1234567890', NOW()),
('cle1234567892', 'clp1234567891', NOW()),
('cle1234567893', 'clp1234567892', NOW()),
('cle1234567894', 'clp1234567893', NOW()); 