import { Card, CardContent } from "@/components/ui/card";
import { ClientRequest, PaginatedResponse } from "@/types/procurement";
import DesktopRequestsTable from "./DesktopRequestsTable";
import TabletRequestsTable from "./TabletRequestsTable";
import MobileRequestsCards from "./MobileRequestsCards";
import TablePagination from "./TablePagination";
import EmptyRequestsState from "./EmptyRequestsState";
import { SearchParams } from "@/app/dashboard/requests/page";

interface RequestsTableProps {
  data: ClientRequest[];
  currentPage: number;
  searchParams: SearchParams; //Record<string, string | undefined>;
}

export default function RequestsTable({
  data,
  currentPage,
  searchParams,
}: RequestsTableProps) {
  // console.log("Rendering RequestsTable with data:", data);
  // const { results: requests, count, next, previous } = data;

  const createPaginationUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") {
        params.set(key, value);
      }
    });
    if (page > 1) {
      params.set("page", page.toString());
    }
    return `/dashboard/requests?${params.toString()}`;
  };

  const hasFilters = Object.keys(searchParams).length > 0;

  if (data.length === 0) {
    return <EmptyRequestsState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-none">
        <CardContent className="p-0">
          <DesktopRequestsTable requests={data} />
          <TabletRequestsTable requests={data} />
          <MobileRequestsCards requests={data} />
        </CardContent>
      </Card>

      <TablePagination
        count={data.length}
        currentPage={currentPage}
        hasNext
        hasPrevious
        searchParams={searchParams}
        createPaginationUrl={createPaginationUrl}
      />
    </div>
  );
}
