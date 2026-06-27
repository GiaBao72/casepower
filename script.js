// SCROLL ANIMATIONS
(function() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
})();

function updateSlotDisplays(count) {
  const el = document.getElementById('remaining-slots');
  if (el) el.textContent = count;
}

// FORM SUBMIT
function handleSubmit() {
  const name  = document.getElementById('f-name').value.trim();
  const phone = document.getElementById('f-phone').value.trim();
  const email = document.getElementById('f-email').value.trim();
  const color = document.querySelector('input[name="color"]:checked').value;

  if (!name || !phone || !email) {
    alert('Vui lòng điền đầy đủ họ tên, số điện thoại và email.');
    return;
  }
  // Kiểm tra SĐT Việt Nam cơ bản (10 số, bắt đầu bằng 0)
  if (!/^0\d{9}$/.test(phone.replace(/\s/g, ''))) {
    alert('Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam 10 số.');
    return;
  }
  // Kiểm tra email cơ bản
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    alert('Email không hợp lệ.');
    return;
  }

  // ── GỬI DỮ LIỆU ──────────────────────────────────────────
  // TODO: thay WEBHOOK_URL bằng endpoint thật (Google Apps Script, n8n, Make, v.v.)
  const WEBHOOK_URL = 'https://WEBHOOK_CUA_BAN.vn/lead';
  fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, email, color, ts: new Date().toISOString() })
  }).catch(() => {}); // silent fail – không block UX nếu webhook chưa có

  // ── FACEBOOK PIXEL LEAD EVENT ──────────────────────────────
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', { content_name: '100WX MINI Early Bird', value: 2000000, currency: 'VND' });
  }

  // ── CẬP NHẬT SLOT ─────────────────────────────────────────
  const slotEl = document.getElementById('remaining-slots');
  if (slotEl) {
    const cur = parseInt(slotEl.textContent);
    if (cur > 0) updateSlotDisplays(cur - 1);
  }

  // ── HIỆN THÔNG BÁO THÀNH CÔNG ─────────────────────────────
  document.querySelector('.pricing-box').innerHTML = `
    <div style="text-align:center; padding: 40px 0;">
      <div style="font-size:56px; margin-bottom:24px;">✅</div>
      <h3 style="font-family:'Barlow Condensed',sans-serif; font-size:32px; font-weight:800; color:var(--cyan); margin-bottom:12px;">ĐẶT HÀNG THÀNH CÔNG!</h3>
      <p style="color:var(--muted); font-size:15px; line-height:1.8;">
        Xin chào <strong style="color:var(--text)">${name}</strong>, suất Early-Bird của bạn đã được ghi nhận.<br>
        Chúng tôi sẽ liên hệ qua <strong style="color:var(--orange)">${phone}</strong> trong vòng 24 giờ.<br>
        <span style="font-size:13px; color:#555; margin-top:8px; display:block;">Màu đã chọn: ${color}</span>
      </p>
    </div>`;
}
