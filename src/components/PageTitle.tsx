'use client';
import { ChevronLeft, LucideProps } from 'lucide-react';
import Link from 'next/link';
import { ForwardRefExoticComponent, RefAttributes } from 'react';

export default function PageTitle(props: {
  title: string;
  variant: string;
  href: string;
  Icon?: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
}) {
  const { title, variant, Icon, href } = props;

  return (
    <div className="text-gray-600">
      <div className={`w-full h-14 px-2 flex items-center justify-between ${variant !== 'no-border-center' && 'border-b'}`} >
        <Link href={href}>
          <ChevronLeft className="w-9 h-full " />
        </Link>
        {variant === 'center' && (
          <h1 className="text-center font-bold text-xl text-green-700 pt-1">{title}</h1>
        )}
        {variant === 'no-border-center' && (
          <h1 className="text-center font-bold text-xl text-gray-600 pt-1">{title}</h1>
        )}
        {variant === 'left-icon' && (
          <div className="ml-4 flex w-full gap-2 justify-around">
            {Icon && <Icon className="color-white" />}
            <h1 className="text-left w-full font-bold"> {title}</h1>
          </div>
        )}
        <div className="w-9 h-9"></div>
      </div>
    </div>
  );
}
