import { TimeRangePicker, FormField } from "@godxjp/ui/data-entry";
import { Card, CardContent, CardHeader, CardTitle } from "@godxjp/ui/data-display";
import { Flex, PageContainer } from "@godxjp/ui/layout";

export default function Demo() {
  return (
    <PageContainer title="TimeRangePicker" subtitle="勤務時間と受付時間の範囲選択">
      <Flex direction="col" gap="lg">
        <Card>
          <CardHeader>
            <CardTitle level={2}>勤務時間</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField id="work-period" label="勤務時間">
              <TimeRangePicker
                id="work-period"
                name="work"
                defaultValue={["09:00", "18:00"]}
                minuteStep={15}
                allowEmpty={[false, false]}
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>終了時刻は任意</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField id="optional-end" label="受付時間">
              <TimeRangePicker
                id="optional-end"
                name="reception"
                defaultValue={["09:00", ""]}
                allowEmpty={[false, true]}
                format="HH:mm:ss"
                showSeconds
              />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle level={2}>日をまたぐ勤務</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField id="overnight" label="夜勤">
              <TimeRangePicker id="overnight" defaultValue={["22:00", "06:00"]} order={false} />
            </FormField>
          </CardContent>
        </Card>
      </Flex>
    </PageContainer>
  );
}
