import { redirect } from "next/navigation";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

// La raíz lleva al VSL conservando los UTMs del anuncio.
export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const qs = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))).toString();
  redirect(qs ? `/vsl?${qs}` : "/vsl");
}
