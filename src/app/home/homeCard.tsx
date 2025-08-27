import Link from 'next/link';
import { JSX } from 'react';

export default function HomeCard(props: {
  icon: JSX.Element;
  title: string;
  subtitle: string;
  linkTo: string;
}) {
  return (
    <Link
      className="w-[48%] h-36 sm:h-40 items-center rounded-lg text-neutral-0 px-2 pt-8 pb-7 bg-green-600 hover:bg-green-600"
      href={`${props.linkTo}`}
    >
      <div className="w-full h-full flex flex-col justify-center">
        <div className="flex flex-col justify-around items-center gap-1">
          {props.icon}
          <p className="text-sm sm:text-xl font-bold text-center w-full">{props.title}</p>
        </div>
        <p className="text-xs sm:text-sm font-medium  opacity-60 text-center w-full">
          {props.subtitle}
        </p>
      </div>
    </Link>
  );
}
