// frontend/src/components/common/OtpInput.jsx
import React, { useRef, useState, useEffect } from 'react';

/**
 * Input OTP 6 digit terpisah.
 * @param {function} onChange - dipanggil saat OTP lengkap berubah (string 6 digit)
 * @param {boolean} error - tampilkan border merah jika ada error
 * @param {function} onComplete - callback saat 6 digit terisi penuh (opsional)
 */
export default function OtpInput({ onChange, error = false, onComplete }) {
  const [values, setValues] = useState(Array(6).fill(''));
  const inputRefs = useRef([]);

  // Saat values berubah, panggil onChange dengan string gabungan
  useEffect(() => {
    const otp = values.join('');
    onChange(otp);
    if (otp.length === 6 && onComplete) {
      onComplete(otp);
    }
  }, [values]);

  const handleChange = (index, e) => {
    const val = e.target.value.replace(/\D/g, ''); // hanya angka
    if (val.length > 1) {
      // Jika paste beberapa digit, isi semua
      const digits = val.slice(0, 6).split('');
      const newValues = [...values];
      digits.forEach((d, i) => {
        if (index + i < 6) newValues[index + i] = d;
      });
      setValues(newValues);
      // Fokus ke input terakhir yang terisi
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    // Auto focus ke input berikutnya jika ada nilai
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: jika kosong, pindah ke input sebelumnya
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Panah kiri/kanan
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const digits = text.split('');
    const newValues = Array(6).fill('');
    digits.forEach((d, i) => { newValues[i] = d; });
    setValues(newValues);
    if (digits.length > 0) {
      inputRefs.current[Math.min(digits.length, 5)]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(idx, e)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all ${
            error ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
          }`}
        />
      ))}
    </div>
  );
}