import { useState } from "react";

import { Pagination } from "@godxjp/ui/navigation";

export default function Demo() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  return (
    <Pagination
      current={page}
      pageSize={size}
      total={248}
      showSizeChanger
      showTotal
      onValueChange={(nextPage, nextSize) => {
        setPage(nextPage);
        setSize(nextSize);
      }}
    />
  );
}
