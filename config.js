/* =========================================================
   ĐỜN KẾT — CẤU HÌNH (giống trang mẫu don-ket.vercel.app)
   ========================================================= */
window.DONKET_CONFIG = {
  TOTAL_QUESTIONS: 10,
  QUESTION_TIME_SECONDS: 30,
  MAX_ATTEMPTS_PER_QUESTION: 3,
  UNLOCK_AFTER_QUESTION: 7,           // sau câu 7 mở khoá 3 nhạc cụ cuối (chặng Di sản)
  POINTS_BY_ATTEMPT: [40, 30, 20],     // lần 1 / lần 2 / lần 3
  POINTS_PER_SECOND_LEFT: 2,           // cộng thêm cho mỗi giây còn lại
  LEADERBOARD_REFRESH_SECONDS: 10,     // bảng xếp hạng tự làm mới (giây) — tăng lên 20–30 nếu rất đông người

  /* Bảng xếp hạng chung (Supabase) — project "giasuchillchill" */
  supabaseUrl: "https://jtpifktjcgxxbycqswhy.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp0cGlma3RqY2d4eGJ5Y3Fzd2h5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNjQ3OTEsImV4cCI6MjEwNjY0MDc5MX0.SHW5ppvEm1oNEt4bEnaPwkGwtgsKvR4aSHpa9j3d9qY",
  supabaseTable: "donket_scores",
  supabasePlayersTable: "donket_players",
  supabaseLeaderboardView: "donket_leaderboard",

  BACKGROUNDS: { mobile: "backgrounds/bg_doc.png", desktop: "backgrounds/bg_ngang.png" },
  BGM_SRC: "audio/nhac_nen.mp3",       // nhạc nền (trang mẫu chưa có file này — thêm vào nếu muốn)
  SFX: {
    success: "audio/sound_effect/success.mp3",
    fail: "audio/sound_effect/fail.mp3",
    leaderboard: "audio/sound_effect/leaderboard.mp3"
  },

  INSTRUMENTS: [
    { id: "dan_tranh", name: "Đàn Tranh", order_index: 1, unlock_group: 1,
      fact: "Đàn Tranh thường đảm nhiệm phần giai điệu chính với âm thanh trong trẻo, mềm mại. Nghệ nhân sử dụng nhiều kỹ thuật nhấn, rung, vuốt để tạo nên nét luyến láy đặc trưng của Đờn ca tài tử." },
    { id: "dan_tam", name: "Đàn Tam", order_index: 2, unlock_group: 1,
      fact: "Đàn Tam có ba dây và âm sắc chắc, đanh, thường giúp làm đầy hòa âm của cả ban nhạc. Đây là một trong những nhạc cụ góp phần tạo nên màu sắc cổ truyền cho Đờn ca tài tử." },
    { id: "dan_bau", name: "Đàn Bầu", order_index: 3, unlock_group: 1,
      fact: "Chỉ với một dây duy nhất, đàn Bầu có thể tạo ra rất nhiều cao độ nhờ kỹ thuật điều khiển cần đàn và khai thác âm bồi. Âm thanh sâu lắng của đàn Bầu thường được ví như tiếng lòng của người Nam Bộ." },
    { id: "dan_ty_ba", name: "Đàn Tỳ Bà", order_index: 4, unlock_group: 1,
      fact: "Đàn Tỳ Bà mang âm sắc sang trọng và giàu biểu cảm. Trong Đờn ca tài tử, nghệ nhân thường dùng kỹ thuật vê và gảy nhanh để tạo những đoạn nhạc uyển chuyển như lời kể chuyện." },
    { id: "dan_nguyet", name: "Đàn Nguyệt", order_index: 5, unlock_group: 1,
      fact: "Đàn Nguyệt (đàn kìm) được xem là một trong những nhạc cụ chủ đạo của Đờn ca tài tử. Âm thanh tròn, vang và sáng giúp dẫn dắt giai điệu cũng như hỗ trợ phần ca rất hiệu quả." },
    { id: "dan_co", name: "Đàn Cò", order_index: 6, unlock_group: 1,
      fact: "Đàn Cò có âm thanh gần với giọng hát con người nhất. Những kỹ thuật kéo, rung và nhấn giúp cây đàn truyền tải cảm xúc da diết, rất phù hợp với các bài bản tài tử." },
    { id: "sao_truc", name: "Sáo Trúc", order_index: 7, unlock_group: 1,
      fact: "Sáo Trúc mang đến âm thanh trong trẻo như gió đồng và sông nước Nam Bộ. Khi kết hợp với các loại đàn dây, sáo giúp tạo không gian âm nhạc thoáng đãng và giàu chất thiên nhiên." },
    { id: "dan_guitar_phim_lom", name: "Đàn Guitar phím lõm", order_index: 8, unlock_group: 2,
      fact: "Đây là nhạc cụ đặc trưng riêng của Đờn ca tài tử Nam Bộ. Người Việt đã cải tiến đàn guitar phương Tây bằng cách khoét lõm các phím để có thể nhấn và luyến theo phong cách âm nhạc truyền thống." },
    { id: "song_lang", name: "Song Lang", order_index: 9, unlock_group: 2,
      fact: "Song Lang không tạo giai điệu mà giữ nhịp cho toàn bộ dàn nhạc. Tiếng \"cắc\" của Song Lang giúp các nghệ nhân phối hợp ăn ý và giữ đúng tiết tấu của bài bản." },
    { id: "dan_sen", name: "Đàn Sến", order_index: 10, unlock_group: 2,
      fact: "Đàn Sến có âm thanh sáng, vang và sắc nét. Trong Đờn ca tài tử, đàn Sến thường đảm nhiệm những câu nhạc nhanh, tạo điểm nhấn và tăng sự sinh động cho bản hòa tấu." }
  ],

  COLLECTION_TRACKS: [
    { id: "da_co_hoai_lang", title: "Dạ Cổ Hoài Lang", audio_url: "audio/collection/da_co_hoai_lang.mp3" },
    { id: "duyen_ky_ngo_ngua_o_bac", title: "Duyên Kỳ Ngộ — Ngựa Ô Bắc", audio_url: "audio/collection/duyen_ky_ngo_ngua_o_bac.mp3" },
    { id: "hoa_tau_dem_xuan_ruc_ro", title: "Hòa tấu — Đêm Xuân Rực Rỡ", audio_url: "audio/collection/hoa_tau_dem_xuan_ruc_ro.mp3" }
  ]
};
window.DONKET_CONFIG.INSTRUMENTS.forEach(function (i) {
  i.image_url = "instruments/" + i.id + ".png";
  i.audio_url = "audio/" + i.id + ".mp3";
});
