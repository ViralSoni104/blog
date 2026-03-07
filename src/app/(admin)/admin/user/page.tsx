import { getPaginatedUsers } from "@/data/user";
import UserTable from "@/components/admin/tables/user-table";
import { UserWithAccounts } from "@/schemas";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Users",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page, search } = await searchParams;
  const currentPage = Number(page) || 1;
  const query = search || "";

  const { data, totalPages } = await getPaginatedUsers(currentPage, 10, query);

  return (
    <div className="p-6">
      <UserTable
        users={data as UserWithAccounts[]}
        currentPage={currentPage}
        totalPages={totalPages}
        search={query}
      />
    </div>
  );
}
