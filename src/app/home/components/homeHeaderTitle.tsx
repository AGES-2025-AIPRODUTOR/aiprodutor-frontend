'use client';

export default function HomeHeaderTitle() {
  return (
    <div className="flex flex-col gap-2 py-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-center text-gray-500 mb-[-4px]">
          Bem-vindo(a)
        </h1>

        <h1 className="text-2xl sm:text-3xl font-bold text-center text-green-600">
          {'João Hortti'}
        </h1>
      </div>
      <h2 className="text-sm sm:text-md text-center opacity-50 font-medium">
        Gerencie sua produção de forma inteligente
      </h2>
    </div>
  );
}
