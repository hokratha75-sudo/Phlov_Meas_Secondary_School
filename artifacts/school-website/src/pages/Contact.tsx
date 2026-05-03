import { useI18n } from "@/lib/i18n";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock, Youtube, CheckCircle2, Loader2 } from "lucide-react";
import { SiTiktok, SiFacebook } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  message: string;
}

const INITIAL_FORM: FormState = { fullName: "", phone: "", email: "", message: "" };

export default function Contact() {
  const { t } = useI18n();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.message.trim()) {
      setError(t("Please fill in your name and message.", "សូមបំពេញឈ្មោះ និងសាររបស់អ្នក។"));
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName.trim(),
          phone: form.phone.trim() || undefined,
          email: form.email.trim() || undefined,
          message: form.message.trim(),
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
      setForm(INITIAL_FORM);
    } catch {
      setError(t("Something went wrong. Please try again.", "មានបញ្ហាកើតឡើង។ សូមព្យាយាមម្តងទៀត។"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col pb-20">
      <div className="bg-primary pt-16 pb-20 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-khmer">
            {t("Contact Us", "ទំនាក់ទំនង")}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/80 text-sm font-medium">
            <span>{t("Home", "ទំព័រដើម")}</span>
            <span>/</span>
            <span className="text-secondary">{t("Contact", "ទំនាក់ទំនង")}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-6 font-khmer">
                {t("Get in Touch", "ទំនាក់ទំនងមកយើង")}
              </h2>
              <p className="text-gray-600 mb-8">
                {t(
                  "Have questions about enrollment, academic programs, or our school? We're here to help. Reach out to us using any of the methods below.",
                  "មានចម្ងល់អំពីការចុះឈ្មោះ កម្មវិធីសិក្សា ឬសាលារបស់យើងទេ? យើងនៅទីនេះដើម្បីជួយ។ ទាក់ទងមកយើងដោយប្រើវិធីសាស្រ្តណាមួយខាងក្រោម។"
                )}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Our Location", "ទីតាំងរបស់យើង")}</h4>
                  <p className="text-gray-600">
                    {t("Treng District, Stung Treng Province, Cambodia", "ស្រុកត្រែង ខេត្តស្ទឹងត្រែង ប្រទេសកម្ពុជា")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Phone Number", "លេខទូរស័ព្ទ")}</h4>
                  <p className="text-gray-600">012 345 678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Email Address", "អ៊ីមែល")}</h4>
                  <p className="text-gray-600">trengsecondaryschool@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <Clock size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Office Hours", "ម៉ោងធ្វើការ")}</h4>
                  <p className="text-gray-600">
                    {t("Monday - Friday: 7:00 AM - 5:00 PM", "ច័ន្ទ - សុក្រ: ៧:០០ ព្រឹក - ៥:០០ ល្ងាច")}<br />
                    {t("Saturday: 7:00 AM - 11:30 AM", "សៅរ៍: ៧:០០ ព្រឹក - ១១:៣០ ព្រឹក")}
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-4">{t("Follow Us", "តាមដានពួកយើង")}</h4>
              <div className="flex items-center gap-3">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <SiFacebook size={20} />
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-[#FF0000] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <Youtube size={20} />
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <SiTiktok size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border shadow-sm p-8 md:p-10">
              <h3 className="text-2xl font-bold text-primary mb-6 font-khmer">
                {t("Send us a Message", "ផ្ញើសារមកយើង")}
              </h3>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <CheckCircle2 size={56} className="text-green-500" />
                  <h4 className="text-xl font-bold text-gray-800">
                    {t("Message Sent!", "សារត្រូវបានផ្ញើ!")}
                  </h4>
                  <p className="text-gray-500 max-w-sm">
                    {t(
                      "Thank you for reaching out. We will get back to you as soon as possible.",
                      "សូមអរគុណសម្រាប់ការទាក់ទងមកយើង។ យើងនឹងឆ្លើយតបភ្លាមៗ។"
                    )}
                  </p>
                  <Button
                    variant="outline"
                    className="mt-2 border-primary text-primary hover:bg-primary hover:text-white rounded-sm"
                    onClick={() => setSubmitted(false)}
                  >
                    {t("Send Another Message", "ផ្ញើសារមួយទៀត")}
                  </Button>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        {t("Full Name", "ឈ្មោះពេញ")} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder={t("Your name", "ឈ្មោះរបស់អ្នក")}
                        className="bg-gray-50 rounded-sm focus-visible:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t("Phone Number", "លេខទូរស័ព្ទ")}</label>
                      <Input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder={t("Your phone number", "លេខទូរស័ព្ទរបស់អ្នក")}
                        className="bg-gray-50 rounded-sm focus-visible:ring-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t("Email Address", "អាសយដ្ឋានអ៊ីមែល")}</label>
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={t("Your email address", "អាសយដ្ឋានអ៊ីមែលរបស់អ្នក")}
                      className="bg-gray-50 rounded-sm focus-visible:ring-primary"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      {t("Message", "សារ")} <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={t("How can we help you?", "តើមានអ្វីអោយយើងជួយទេ?")}
                      className="bg-gray-50 min-h-[150px] rounded-sm focus-visible:ring-primary"
                      required
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
                      {error}
                    </p>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-sm disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        {t("Sending...", "កំពុងផ្ញើ...")}
                      </span>
                    ) : (
                      t("Submit Message", "បញ្ជូនសារ")
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Google Map */}
        <div className="mt-16 w-full">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="text-secondary shrink-0" size={20} />
            <p className="font-semibold text-gray-700">
              {t("Treng District, Stung Treng Province, Cambodia", "ស្រុកត្រែង ខេត្តស្ទឹងត្រែង ប្រទេសកម្ពុជា")}
            </p>
          </div>
          <div className="w-full h-[450px] border shadow-sm overflow-hidden">
            <iframe
              title="Treng Secondary School Location"
              src="https://maps.google.com/maps?q=Stung+Treng+Cambodia&output=embed&z=13"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="mt-3 flex justify-end">
            <a
              href="https://maps.google.com/maps?q=Stung+Treng+Cambodia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-secondary font-semibold hover:underline flex items-center gap-1"
            >
              <MapPin size={14} />
              {t("Open in Google Maps", "បើកក្នុង Google Maps")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
