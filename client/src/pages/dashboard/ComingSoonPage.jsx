import { Wrench } from "lucide-react";
import { PageHeader } from "../../components/dashboard/PageHeader";

export function ComingSoonPage({ title, description }) {
  return (
    <>
      <PageHeader title={title} description={description} />

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-maastel-100 text-maastel-600">
          <Wrench size={28} />
        </div>
        <h3 className="mt-4 text-xl font-black text-graphite-900">
          Sección en construcción
        </h3>
        <p className="mt-2 max-w-md text-sm text-gray-600">
          Esta sección estará disponible muy pronto. Estamos trabajando para que
          puedas gestionar todo desde aquí.
        </p>
      </div>
    </>
  );
}
