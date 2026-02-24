import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-[#5D2A1A]">404 - Not Found</h1>
      <p className="text-lg text-[#5D2A1A]">Oops! A página que você está procurando não existe.</p>

      <Link href="/" className="mt-4 text-[#5D2A1A] font-bold">
        Voltar para a página inicial
      </Link>
    </div>
  );
}