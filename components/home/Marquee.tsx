export default function Marquee() {
  const phrases = [
    "An cư xứng tầm",
    "Đầu tư bền vững",
    "Chuẩn pháp lý minh bạch",
    "Tư vấn tận tâm",
    "Hơn 1.200 giao dịch thành công",
    "Đồng hành trọn đời",
  ];
  const doubled = [...phrases, ...phrases];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {doubled.map((p, i) => (
          <span key={i}>
            ✦ {p}
          </span>
        ))}
      </div>
    </div>
  );
}
