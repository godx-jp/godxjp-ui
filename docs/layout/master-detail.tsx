import { useState } from "react";
import { CreditCard, ShieldCheck, Users } from "lucide-react";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@godxjp/ui/data-display";
import { Button, Text } from "@godxjp/ui/general";
import { Flex, MasterDetail, PageContainer } from "@godxjp/ui/layout";

const services = [
  {
    id: "members",
    label: "メンバー管理",
    description: "招待、状態、所属チーム",
    icon: Users,
    count: 128,
  },
  {
    id: "security",
    label: "セキュリティ",
    description: "MFAポリシーと監査ログ",
    icon: ShieldCheck,
    count: 6,
  },
  {
    id: "billing",
    label: "請求",
    description: "プラン、請求書、支払い方法",
    icon: CreditCard,
    count: 12,
  },
];

/**
 * MasterDetail — responsive two-region geometry with consumer-owned selection semantics. The
 * independent detail readout demonstrates that the layout never infers or mutates selection.
 */
export default function Demo() {
  const [selectedId, setSelectedId] = useState("members");
  const selected = services.find((service) => service.id === selectedId) ?? services[0];
  const SelectedIcon = selected.icon;

  return (
    <PageContainer title="MasterDetail" subtitle="選択可能なmaster railと詳細region">
      <MasterDetail
        railWidth="compact"
        masterLabel="管理カテゴリー"
        detailLabel={`${selected.label}の詳細`}
        master={
          <Flex direction="col" gap="xs">
            {services.map((service) => {
              const Icon = service.icon;
              const selectedService = service.id === selectedId;

              return (
                <Button
                  key={service.id}
                  variant={selectedService ? "secondary" : "ghost"}
                  aria-pressed={selectedService}
                  onClick={() => setSelectedId(service.id)}
                >
                  <Icon aria-hidden="true" />
                  {service.label}
                  <Badge tone="neutral">{service.count}</Badge>
                </Button>
              );
            })}
          </Flex>
        }
      >
        <Card>
          <CardHeader>
            <Flex align="center" gap="sm">
              <SelectedIcon aria-hidden="true" />
              <CardTitle level={2}>{selected.label}</CardTitle>
            </Flex>
            <CardDescription>{selected.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Flex direction="col" gap="md">
              <Text>現在の設定件数: {selected.count}</Text>
              <Button>設定を開く</Button>
            </Flex>
          </CardContent>
        </Card>
      </MasterDetail>
    </PageContainer>
  );
}
