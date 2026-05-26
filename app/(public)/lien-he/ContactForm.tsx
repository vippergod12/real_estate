"use client";

import { useState } from "react";
import { getZaloUrl } from "@/lib/utils/zalo";
import { SITE_NAME } from "@/lib/seo/siteConfig";
import {
  ALLOWED_SEGMENTS,
  validateEmail,
  validateMessage,
  validateName,
  validatePhone,
  validateSegment,
  type ValidationResult,
} from "@/lib/utils/validation";

interface FormState {
  name: string;
  phone: string;
  email: string;
  segment: string;
  message: string;
}

const EMPTY: FormState = {
  name: "",
  phone: "",
  email: "",
  segment: "",
  message: "",
};

type FieldKey = keyof FormState;
type FieldErrors = Partial<Record<FieldKey, string>>;

function validateAll(state: FormState): {
  errors: FieldErrors;
  normalized: FormState;
} {
  const errors: FieldErrors = {};
  const normalized: FormState = { ...state };

  const checks: Array<[FieldKey, ValidationResult]> = [
    ["name", validateName(state.name)],
    ["phone", validatePhone(state.phone)],
    ["email", validateEmail(state.email)],
    ["segment", validateSegment(state.segment)],
    ["message", validateMessage(state.message)],
  ];

  for (const [key, res] of checks) {
    if (!res.ok) errors[key] = res.error!;
    else if (res.value !== undefined) normalized[key] = res.value;
  }

  return { errors, normalized };
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>(EMPTY);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitErr, setSubmitErr] = useState("");

  function update<K extends FieldKey>(key: K, value: FormState[K]) {
    setState((s) => ({ ...s, [key]: value }));
    if (fieldErrors[key]) {
      // Clear the error as soon as the user edits a field that previously failed.
      setFieldErrors((e) => ({ ...e, [key]: undefined }));
    }
    if (success) setSuccess(null);
  }

  function validateField(key: FieldKey) {
    setTouched((t) => ({ ...t, [key]: true }));
    let res: ValidationResult;
    switch (key) {
      case "name":
        res = validateName(state.name);
        break;
      case "phone":
        res = validatePhone(state.phone);
        break;
      case "email":
        res = validateEmail(state.email);
        break;
      case "segment":
        res = validateSegment(state.segment);
        break;
      case "message":
        res = validateMessage(state.message);
        break;
    }
    setFieldErrors((e) => ({ ...e, [key]: res.ok ? undefined : res.error }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitErr("");
    setSuccess(null);

    const { errors, normalized } = validateAll(state);
    setFieldErrors(errors);
    setTouched({
      name: true,
      phone: true,
      email: true,
      segment: true,
      message: true,
    });
    if (Object.values(errors).some(Boolean)) {
      setSubmitErr("Vui lòng kiểm tra lại các trường được đánh dấu.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...normalized, source: "contact-form" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Không gửi được. Vui lòng thử lại.");
      }

      setSuccess(
        `Cảm ơn ${normalized.name}! Yêu cầu của bạn đã được gửi — cố vấn ${SITE_NAME} sẽ phản hồi trong vòng 15 phút.`
      );
      setState(EMPTY);
      setFieldErrors({});
      setTouched({});
    } catch (err: any) {
      setSubmitErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  const invalid = (key: FieldKey) => Boolean(fieldErrors[key] && touched[key]);

  return (
    <form
      onSubmit={submit}
      className="card contact-form"
      style={{ padding: "clamp(20px, 4vw, 28px)", background: "#fff" }}
      noValidate
    >
      {submitErr && (
        <div className="alert alert-error" style={{ marginBottom: 14 }}>
          ⚠ {submitErr}
        </div>
      )}

      {success && (
        <div
          className="alert alert-success"
          style={{ marginBottom: 14 }}
          role="status"
          aria-live="polite"
        >
          ✓ {success}
          <div style={{ marginTop: 10 }}>
            <a
              href={getZaloUrl(
                `Chào ${SITE_NAME}, tôi vừa gửi form tư vấn và muốn trao đổi thêm.`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-gold btn-sm"
              style={{ marginTop: 2 }}
            >
              Chat Zalo ngay →
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className={`field ${invalid("name") ? "has-error" : ""}`}>
          <label>Họ và tên *</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => update("name", e.target.value)}
            onBlur={() => validateField("name")}
            placeholder="Nguyễn Văn A"
            autoComplete="name"
            maxLength={120}
            aria-invalid={invalid("name")}
          />
          {invalid("name") && <small className="field-error">{fieldErrors.name}</small>}
        </div>

        <div className={`field ${invalid("phone") ? "has-error" : ""}`}>
          <label>Số điện thoại *</label>
          <input
            type="tel"
            inputMode="tel"
            value={state.phone}
            onChange={(e) => update("phone", e.target.value)}
            onBlur={() => validateField("phone")}
            placeholder="0xxx xxx xxx hoặc +84xxx xxx xxx"
            autoComplete="tel"
            maxLength={20}
            aria-invalid={invalid("phone")}
          />
          {invalid("phone") && (
            <small className="field-error">{fieldErrors.phone}</small>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: 16 }}>
        <div className={`field ${invalid("email") ? "has-error" : ""}`}>
          <label>Email</label>
          <input
            type="email"
            value={state.email}
            onChange={(e) => update("email", e.target.value)}
            onBlur={() => validateField("email")}
            placeholder="ban@example.com"
            autoComplete="email"
            maxLength={160}
            aria-invalid={invalid("email")}
          />
          {invalid("email") && (
            <small className="field-error">{fieldErrors.email}</small>
          )}
        </div>

        <div className={`field ${invalid("segment") ? "has-error" : ""}`}>
          <label>Phân khúc quan tâm</label>
          <select
            value={state.segment}
            onChange={(e) => update("segment", e.target.value)}
            onBlur={() => validateField("segment")}
            aria-invalid={invalid("segment")}
          >
            <option value="">Chưa xác định</option>
            {ALLOWED_SEGMENTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {invalid("segment") && (
            <small className="field-error">{fieldErrors.segment}</small>
          )}
        </div>
      </div>

      <div
        className={`field ${invalid("message") ? "has-error" : ""}`}
        style={{ marginTop: 16 }}
      >
        <label>
          Nội dung
          <span className="field-counter">
            {state.message.length}/2000
          </span>
        </label>
        <textarea
          rows={4}
          value={state.message}
          onChange={(e) => update("message", e.target.value)}
          onBlur={() => validateField("message")}
          placeholder="Hãy mô tả ngắn về nhu cầu của bạn..."
          maxLength={2000}
          aria-invalid={invalid("message")}
        />
        {invalid("message") && (
          <small className="field-error">{fieldErrors.message}</small>
        )}
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        style={{ marginTop: 20 }}
        disabled={saving}
      >
        {saving ? "Đang gửi..." : "Gửi yêu cầu →"}
      </button>
      <p className="muted" style={{ marginTop: 10, fontSize: "0.8rem" }}>
        Thông tin của bạn được lưu an toàn — chúng tôi sẽ liên hệ trong vòng 15 phút.
      </p>
    </form>
  );
}
