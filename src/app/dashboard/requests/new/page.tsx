import RequestPageWrapper from "../components/RequestPageWrapper";

interface SearchParams {
  id?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function NewRequestPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestId = params.id;

  return <RequestPageWrapper requestId={requestId} />;
}
