import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function Contact() {
  const { t } = useI18n();

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
                    {t("National Road 5, Sdav Commune, Battambang Province, Cambodia", "ផ្លូវជាតិលេខ៥ ឃុំស្ដៅ ខេត្តបាត់ដំបង ប្រទេសកម្ពុជា")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Phone Number", "លេខទូរស័ព្ទ")}</h4>
                  <p className="text-gray-600">+855 12 345 678<br />+855 98 765 432</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-full shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg mb-1">{t("Email Address", "អ៊ីមែល")}</h4>
                  <p className="text-gray-600">info@sdavsantiphear.edu.kh<br />admissions@sdavsantiphear.edu.kh</p>
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
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border shadow-sm p-8 md:p-10">
              <h3 className="text-2xl font-bold text-primary mb-6 font-khmer">
                {t("Send us a Message", "ផ្ញើសារមកយើង")}
              </h3>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t("Full Name", "ឈ្មោះពេញ")}</label>
                    <Input placeholder={t("Your name", "ឈ្មោះរបស់អ្នក")} className="bg-gray-50 rounded-sm focus-visible:ring-primary" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">{t("Phone Number", "លេខទូរស័ព្ទ")}</label>
                    <Input placeholder={t("Your phone number", "លេខទូរស័ព្ទរបស់អ្នក")} className="bg-gray-50 rounded-sm focus-visible:ring-primary" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{t("Email Address", "អាសយដ្ឋានអ៊ីមែល")}</label>
                  <Input type="email" placeholder={t("Your email address", "អាសយដ្ឋានអ៊ីមែលរបស់អ្នក")} className="bg-gray-50 rounded-sm focus-visible:ring-primary" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">{t("Message", "សារ")}</label>
                  <Textarea 
                    placeholder={t("How can we help you?", "តើមានអ្វីអោយយើងជួយទេ?")} 
                    className="bg-gray-50 min-h-[150px] rounded-sm focus-visible:ring-primary" 
                  />
                </div>
                
                <Button className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold h-12 text-lg rounded-sm">
                  {t("Submit Message", "បញ្ជូនសារ")}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mt-16 w-full h-[400px] bg-gray-200 border relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center flex-col text-gray-500">
            <MapPin size={48} className="mb-4 opacity-50" />
            <p className="font-semibold text-lg">{t("Interactive Map Placeholder", "ផែនទី")}</p>
            <p className="text-sm">{t("Sdao Sontepheap High School Location", "ទីតាំង វិទ្យាល័យ ស្ដៅសន្តិភាព")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
