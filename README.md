# KotoPath (言パス) — Ứng Dụng Học Tiếng Nhật Giao Tiếp Từ N5 Đến N1

**KotoPath (言パス)** là nền tảng web học tiếng Nhật giao tiếp thực chiến được thiết kế dựa trên sự kết hợp tinh hoa UI/UX từ các ứng dụng học ngôn ngữ hàng đầu:
- **Duolingo**: Lộ trình học theo chặng trực quan, hệ thống Streak, XP, Daily Goal và phản hồi âm thanh tức thì.
- **LingoDeer**: Bố cục ngữ pháp Tip-Sheet rõ ràng trước bài học, hiển thị chuẩn chữ Nhật kèm Furigana (`<ruby>`) và bài tập ghép câu.
- **Busuu**: Bảng kiểm năng lực **Can-Do (JF Standard)** và học theo tình huống thực tế.
- **Bunpro & WaniKani**: Phân tầng lộ trình từ **JLPT N5 → N1** và hệ thống ôn tập ngắt quãng **SRS** tốc độ cao hỗ trợ phím tắt (`Space`, `1-4`).
- **OJAD & Speak**: Phòng lab **Pitch Accent** trực quan hóa cao độ từng mora bằng biểu đồ SVG + **Shadowing Studio** + **AI Roleplay Arena**.

## Tính năng nổi bật

1. **Lộ trình Hội thoại Thực chiến (N5 → N1)**:
   - 5 giai đoạn từ Sinh tồn (N5), Giao tiếp đời thường & khẩu ngữ rút gọn `~てる / ~ちゃう` (N4), Nghệ thuật Aizuchi (N3), Kính ngữ công sở Keigo (N2) đến Sắc thái Honne–Tatemae (N1).
   - Mỗi bài học gồm 3 bước: *Tip-Sheet Ngữ pháp → Hội thoại mẫu (kèm TTS) → Thực hành 4 dạng bài tập*.
2. **Shadowing Studio (Luyện nói đuổi)**:
   - Trình phát từng câu với tốc độ `0.65x – 1.1x`, chế độ lặp câu, 3 bước Shadowing (*Nghe hiểu → Nhẩm theo → Nói đuổi 100%*).
   - Hỗ trợ ghi âm giọng nói qua Micro (`MediaRecorder`) và chấm điểm phát âm tiếng Nhật (`Web SpeechRecognition ja-JP`).
3. **AI Roleplay Arena**:
   - Đóng vai các tình huống thực tế: *Conbini Tokyo, Quán Izakaya, Tán gẫu bạn Nhật (Tameguchi), Phỏng vấn Baito (Keigo)*.
   - **Smart Hint Drawer** gợi ý 3 sắc thái trả lời (*Thân mật / Lịch sự / Tự nhiên & Keigo*).
4. **Pitch Accent & Kana Lab**:
   - Biểu đồ SVG minh họa 4 quy luật trọng âm (*Heiban, Atamadaka, Nakadaka, Odaka*) qua các cặp tối thiểu (*箸 vs 橋*, *雨 vs 飴*, *牡蠣 vs 柿*, *花 vs 鼻*).
   - Bảng Hiragana & Katakana tương tác kèm âm thanh và mẹo ghi nhớ hình ảnh.
5. **Smart SRS Review & Bản đồ Thành thạo**:
   - Thuật toán lặp lại ngắt quãng SM-2 lưu trữ cục bộ (`localStorage`).
   - Công thức **Daily Fluency Loop** (30% Input · 30% Nghe · 20% Shadowing · 20% Giao tiếp).

## Công nghệ sử dụng

- **React 19 + TypeScript + Vite**
- **Tailwind CSS v4** (hỗ trợ Dark Mode & Responsive Mobile Bottom Nav)
- **Web Speech API** (`speechSynthesis` `ja-JP` & `SpeechRecognition`) + **Web Audio API**
- **Lucide React**

## Cài đặt & Chạy Local

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```
