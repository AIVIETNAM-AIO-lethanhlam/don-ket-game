/* =========================================================
   ĐỜN KẾT — CẤU HÌNH GAME
   Chỉnh sửa file này để đổi nhạc cụ, file âm thanh, luật chơi
   và kết nối bảng xếp hạng chung (Supabase).
   ========================================================= */
window.DONKET_CONFIG = {
  questionCount: 10,     // số câu mỗi lượt chơi
  secondsPerQuestion: 30,// thời gian mỗi câu (giây)
  triesPerQuestion: 3,   // số lượt chọn tối đa mỗi câu
  optionsPerQuestion: 8, // số nhạc cụ hiển thị để chọn
  // Điểm tối đa theo lượt trả lời đúng (lần 1, lần 2, lần 3).
  // Điểm thực nhận = điểm tối đa × (50% + 50% × thời gian còn lại / tổng thời gian)
  pointsByTry: [100, 60, 30],

  /* ---------- BẢNG XẾP HẠNG CHUNG (tuỳ chọn) ----------
     Để trống => bảng xếp hạng chỉ lưu trên từng máy.
     Điền URL + anon key của Supabase (xem README) => mọi người
     chơi trên mọi thiết bị dùng chung 1 bảng xếp hạng. */
  // Đã kết nối: project "giasuchillchill" (Singapore), bảng donket_scores.
  // anon key là khoá công khai, được phép để trong code web.
  supabaseUrl: "https://jtpifktjcgxxbycqswhy.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGlma3RqY2d4eGJ5Y3Fzd2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNjQ3OTEsImV4cCI6MjEwNjY0MDc5MX0.SHW5ppvEm1oNEt4bEnaPwkGwtgsKvR4aSHpa9j3d9qY",
  supabaseTable: "donket_scores",

  /* ---------- NHẠC CỤ ----------
     audio: danh sách file âm thanh (mp3/m4a) trong thư mục /audio.
     Nếu có nhiều file, mỗi lượt chơi sẽ chọn ngẫu nhiên 1 file. */
  instruments: [
    {
      id: "dan-kim", name: "Đàn Kìm", alt: "Đàn Nguyệt", icon: "kim",
      audio: ["audio/dan-kim.mp3"],
      desc: "Hộp đàn tròn như mặt trăng, 2 dây, cần dài với phím cao. Là cây đàn chủ đạo, giữ “linh hồn” của dàn Đờn ca tài tử."
    },
    {
      id: "dan-tranh", name: "Đàn Tranh", alt: "Thập lục", icon: "tranh",
      audio: ["audio/dan-tranh.mp3"],
      desc: "Đàn gảy nhiều dây (thường 16 dây) căng trên những con nhạn. Tiếng đàn trong trẻo, luyến láy mềm mại."
    },
    {
      id: "dan-ty-ba", name: "Đàn Tỳ Bà", icon: "tyba",
      audio: ["audio/dan-ty-ba.mp3"],
      desc: "Thân đàn hình quả lê bổ đôi, 4 dây. Tiếng đàn sáng, đanh, thường dùng trong những đoạn nhạc rộn ràng."
    },
    {
      id: "dan-co", name: "Đàn Cò", alt: "Đàn Nhị", icon: "co",
      audio: ["audio/dan-co.mp3"],
      desc: "Đàn kéo 2 dây bằng vĩ (cung). Âm sắc gần với giọng người, diễn tả được cả nỗi buồn lẫn niềm vui."
    },
    {
      id: "dan-sen", name: "Đàn Sến", icon: "sen",
      audio: ["audio/dan-sen.mp3"],
      desc: "Mặt đàn hình hoa mai/lục giác, 2 dây, phím cao. Tiếng đàn tươi sáng, thường đối đáp với đàn kìm."
    },
    {
      id: "dan-bau", name: "Đàn Bầu", alt: "Độc huyền cầm", icon: "bau",
      audio: ["audio/dan-bau.mp3"],
      desc: "Chỉ có 1 dây, người chơi gảy bồi âm và uốn cần đàn để tạo tiếng ngân nga, luyến láy rất đặc trưng."
    },
    {
      id: "sao-truc", name: "Sáo Trúc", icon: "sao",
      audio: ["audio/sao-truc.mp3"],
      desc: "Ống trúc thổi ngang với các lỗ bấm. Tiếng sáo bay bổng, gợi khung cảnh đồng quê sông nước."
    },
    {
      id: "song-lang", name: "Song Lang", icon: "songlang",
      audio: ["audio/song-lang.mp3"],
      desc: "Nhạc cụ gõ nhỏ bằng gỗ, người đàn dùng chân gõ để giữ nhịp. Được ví là “nhạc trưởng” của Đờn ca tài tử."
    },
    {
      id: "guitar-phim-lom", name: "Đàn Guitar phím lõm", icon: "guitar",
      audio: ["audio/guitar-phim-lom.mp3"],
      desc: "Cây guitar được khoét lõm phím để nhấn, rung, luyến láy như đàn Việt — sáng tạo độc đáo của nghệ nhân Nam Bộ."
    },
    {
      id: "dan-tam", name: "Đàn Tam", icon: "tam",
      audio: ["audio/dan-tam.mp3"],
      desc: "Đàn 3 dây, bầu đàn tròn bịt da trăn, cần dài không phím. Tiếng đàn trầm ấm, hơi đục."
    }
  ]
};
