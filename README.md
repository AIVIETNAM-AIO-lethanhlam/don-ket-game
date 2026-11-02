# Đờn Kết — Game nhận diện nhạc cụ Đờn ca tài tử

Web tĩnh (HTML/CSS/JS thuần, không cần build), chạy tốt trên điện thoại, máy tính bảng và máy tính.

## Cấu trúc
```
index.html      giao diện
style.css       màu sắc, bố cục
app.js          logic game
config.js       ⚙️ nơi chỉnh nhạc cụ, file âm thanh, luật chơi, bảng xếp hạng
audio/          🎵 đặt 10 file âm thanh nhạc cụ vào đây (xem audio/README.txt)
supabase.sql    tạo bảng xếp hạng chung (tuỳ chọn)
vercel.json     cấu hình cache khi đưa lên Vercel
```

## 1. Thêm âm thanh (bắt buộc)
Chép 10 file mp3 vào thư mục `audio/`, đặt tên đúng như trong `audio/README.txt`.
Nếu thiếu file, câu hỏi đó sẽ báo "Không tải được âm thanh".

## 2. Chạy thử trên máy
Mở terminal trong thư mục này và chạy:
```
python -m http.server 8000
```
Rồi mở http://localhost:8000. (Mở trực tiếp file index.html cũng chạy, nhưng nên dùng cách trên.)

## 3. Đưa lên mạng (Vercel — miễn phí, chịu tải rất tốt)
1. Vào https://vercel.com → **Add New → Project**.
2. Kéo thả cả thư mục này lên (hoặc đẩy lên GitHub rồi Import).
3. Framework Preset: **Other**, không cần Build Command. Bấm **Deploy**.

Vì là web tĩnh, Vercel phân phối qua CDN nên hàng trăm/hàng nghìn người truy cập cùng lúc
vẫn mượt. File âm thanh được cache 7 ngày trên trình duyệt.

## 4. Bảng xếp hạng chung (tuỳ chọn)
Mặc định, bảng xếp hạng lưu **trên từng thiết bị** (phù hợp khi đặt 1–2 máy tại quầy).
Muốn mọi người chơi bằng điện thoại riêng cùng chung 1 bảng xếp hạng:
1. Tạo project miễn phí tại https://supabase.com.
2. Vào **SQL Editor**, dán nội dung `supabase.sql` → **Run**.
3. Vào **Project Settings → API**, chép **Project URL** và **anon public key**
   vào `supabaseUrl` và `supabaseAnonKey` trong `config.js`.

Nếu mạng ở sự kiện bị chập chờn, điểm vẫn được lưu trên máy và tự gửi lại khi có mạng —
game không bao giờ bị kẹt ở bước nhập tên hay nộp điểm.

## Luật chơi (chỉnh trong config.js)
- 10 câu, mỗi câu 30 giây, tối đa 3 lượt chọn, 8 lựa chọn mỗi câu.
- Điểm tối đa: lần 1 = 100, lần 2 = 60, lần 3 = 30; nhân với hệ số thời gian (50%–100%).
- Đoán đúng một nhạc cụ sẽ mở khoá thẻ trong **Bộ sưu tập**.
- Ở quầy: bấm **Người chơi tiếp theo** / **Đổi người chơi** để người khác nhập tên mới.
