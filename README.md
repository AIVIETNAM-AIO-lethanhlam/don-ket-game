# Đờn Kết — Game nhận diện nhạc cụ Đờn ca tài tử

Bản dựng lại giao diện và luồng chơi của trang mẫu don-ket.vercel.app,
dùng chung file CSS, font, hình ảnh và âm thanh gốc. Web tĩnh (HTML/CSS/JS), không cần build.

## Cấu trúc
```
index.html            khung trang
app.js                toàn bộ màn hình & luồng chơi
config.js             luật chơi, danh sách nhạc cụ, kết nối Supabase
style.css             hiệu ứng chuyển động bổ sung
assets/css/donket.css CSS gốc của trang mẫu
assets/media/         font Be Vietnam Pro + Lora
audio/                10 âm thanh nhạc cụ, hiệu ứng, 3 bài nhạc bộ sưu tập
instruments/ backgrounds/ brand/   hình ảnh
supabase.sql          cấu trúc database (đã tạo sẵn)
```

## Đưa lên Cloudflare Pages (khuyên dùng — không giới hạn băng thông)
1. Upload toàn bộ nội dung thư mục này lên GitHub (index.html nằm ở gốc repo).
2. dash.cloudflare.com > Workers & Pages > Create > tab **Pages** > Connect to Git > chọn repo.
3. Framework preset: None · Build command: để trống · Build output directory: để trống.
4. Save and Deploy → link dạng https://don-ket-game.pages.dev
Mỗi lần cập nhật code trên GitHub, Cloudflare tự đưa bản mới lên.
File `_headers` cho điện thoại lưu sẵn âm thanh/hình ảnh 30 ngày.
(`vercel.json` chỉ dùng cho Vercel, có thể xoá.)

## Luật chơi (config.js)
10 câu · 30 giây/câu (đồng hồ chạy khi bấm nghe) · tối đa 3 lần thử ·
điểm 40/30/20 + 2 điểm mỗi giây còn lại · sau câu 7 mở khoá 3 nhạc cụ cuối.

## Nhạc nền (tuỳ chọn)
Trang mẫu có nút nhạc nền nhưng chưa có file. Muốn có nhạc nền ở trang chủ và bảng xếp hạng,
thêm file `audio/nhac_nen.mp3`.
