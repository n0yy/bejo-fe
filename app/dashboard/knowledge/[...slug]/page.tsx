import DashboardHeader from "@/components/dashboard/DashboardHeader";

const data = [
  {
    id: 1,
    title: "Add Knowledge 1 -- Field & Control",
    description: "Description 1",
    url: "/dashboard/knowledge/add/level-1",
  },
  {
    id: 2,
    title: "Add Knowledge 2 -- Supervisory",
    description: "Description 2",
    url: "/dashboard/knowledge/add/level-2",
  },
  {
    id: 3,
    title: "Add Knowledge 3 -- Planning",
    description: "Description 3",
    url: "/dashboard/knowledge/add/level-3",
  },
  {
    id: 4,
    title: "Add Knowledge 4 -- Management",
    description: "Description 4",
    url: "/dashboard/knowledge/add/level-4",
  },
];

export default function AddKnowledge({
  params,
}: {
  params: { slug: string[] };
}) {
  console.log(params.slug);
  const fullSlug = `/dashboard/knowledge/${params.slug.join("/")}`;

  const matched = data.find((item) => item.url === fullSlug);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Knowledge", href: "/dashboard/knowledge" },
    {
      label: matched?.title.split(" -- ")[1] ?? "Unknown",
      isCurrentPage: true,
    },
  ];

  return (
    <div className="px-6">
      <DashboardHeader
        title={matched?.title.split(" -- ")[1] ?? "Knowledge Not Found"}
        breadcrumbs={breadcrumbs}
      />
      <div className="mt-4 text-gray-600">
        {matched?.description ??
          "No description available for this knowledge level."}
      </div>
    </div>
  );
}
