import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { PageContainer } from "@godxjp/ui/layout";
import { Tabs } from "@godxjp/ui/navigation";

export default function Demo() {
  return (
    <div dir="rtl" lang="ar">
      <PageContainer title="علامات التبويب" subtitle="RTL keyboard and layout evidence">
        <Card>
          <CardHeader>
            <CardTitle>إعدادات الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              dir="rtl"
              defaultValue="profile"
              items={[
                { value: "profile", label: "الملف الشخصي", content: "معلومات الملف الشخصي" },
                { value: "security", label: "الأمان", content: "إعدادات الأمان" },
                { value: "recovery", label: "الاسترداد", content: "طرق الاسترداد" },
              ]}
            />
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
