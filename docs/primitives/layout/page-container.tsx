import { PageContainer } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <PageContainer
      title="PageContainer"
      subtitle="Subtitle"
      extra={<button type="button">Extra</button>}
    >
      Content
    </PageContainer>
  );
}
