import { Card, CardContent } from "@/components/ui/card";
import { ClientRequest, PaginatedResponse } from "@/types/procurement";
import DesktopRequestsTable from "./DesktopRequestsTable";
import TabletRequestsTable from "./TabletRequestsTable";
import MobileRequestsCards from "./MobileRequestsCards";
import TablePagination from "./TablePagination";
import EmptyRequestsState from "./EmptyRequestsState";
import { SearchParams } from "@/app/dashboard/requests/page";

interface RequestsTableProps {
  data: PaginatedResponse<ClientRequest>;
  currentPage: number;
  searchParams: SearchParams; //Record<string, string | undefined>;
}

export default function RequestsTable({
  data,
  currentPage,
  searchParams,
}: RequestsTableProps) {
  const { results: requests, count, next, previous } = data;

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

  if (requests.length === 0) {
    return <EmptyRequestsState hasFilters={hasFilters} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <DesktopRequestsTable requests={requests} />
          <TabletRequestsTable requests={requests} />
          <MobileRequestsCards requests={requests} />
        </CardContent>
      </Card>

      <TablePagination
        count={count}
        currentPage={currentPage}
        hasNext={!!next}
        hasPrevious={!!previous}
        searchParams={searchParams}
        createPaginationUrl={createPaginationUrl}
      />
    </div>
  );
}
