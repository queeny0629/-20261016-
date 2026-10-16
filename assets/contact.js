(() => {
  'use strict';
  const form = document.getElementById('inquiryForm');
  if (!form) return;
  const name = document.getElementById('inquiryName');
  const email = document.getElementById('inquiryEmail');
  const message = document.getElementById('inquiryMessage');
  const time = document.getElementById('inquiryTime');
  const services = [...form.querySelectorAll('input[name="entry.1610329698"]')];
  const status = document.getElementById('inquiryStatus');
  const copy = document.getElementById('copyInquiry');
  copy.hidden = false;
  function validateServices() {
    services[0].setCustomValidity(services.some(item => item.checked) ? '' : '請至少選擇一項需求。');
  }
  services.forEach(item => item.addEventListener('change', validateServices));
  validateServices();
  [name, message].forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
  function validateInquiry() {
    validateServices();
    name.setCustomValidity(name.value.trim() ? '' : '請輸入您的姓名或稱呼。');
    message.setCustomValidity(message.value.trim() ? '' : '請輸入需求簡介。');
    return form.reportValidity();
  }
  form.addEventListener('submit', event => {
    if (!validateInquiry()) { event.preventDefault(); return; }
    // Allow native URL-encoded POST navigation to Google in a new tab.
    // Checked checkboxes naturally produce repeated entry.1610329698 keys.
    // No hidden iframe, fetch/no-cors, or unverified success message.
    status.textContent = '請在新開啟的 Google 表單頁面查看提交結果。本頁無法確認是否已收件；您的填寫內容會保留在此。';
  });
  copy.addEventListener('click', async () => {
    if (!validateInquiry()) return;
    const text = [
      '姓名／稱呼：' + name.value.trim(),
      '聯絡電子信箱：' + email.value.trim(),
      '您的需求：' + services.filter(item => item.checked).map(item => item.value).join('、'),
      '適合聯絡的時間：' + time.value, '',
      '需求簡介：', message.value.trim()
    ].join('\r\n');
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = '需求內容已複製。複製內容不會送出表單。';
    } catch {
      let area = document.getElementById('inquiryCopyText');
      if (!area) {
        area = document.createElement('textarea');
        area.id = 'inquiryCopyText';
        area.className = 'inquiry-copy-text';
        area.readOnly = true;
        area.rows = 8;
        area.setAttribute('aria-label', '請複製以下需求內容');
        form.append(area);
      }
      area.value = text;
      area.focus();
      area.select();
      status.textContent = '請複製下方文字；此操作不會送出表單。';
    }
  });
})();
