import { ChartArea, FileText, History, MapPin, TreeDeciduous } from 'lucide-react';
import HomeCard from './components/homeCard';
import HomeHeaderTitle from './components/homeHeaderTitle';

export default function Home() {
  const itemIconSizing = 'w-8 h-8 sm:w-10 sm:h-10';
  const homeItems = [
    // {
    //   title: 'Meu Cadastro',
    //   subtitle: 'Gerencie seus dados pessoais',
    //   icon: <UserRound className={itemIconSizing} />,
    //   linkTo: '/cadastro',
    // },
    {
      title: 'Controle de Safra',
      subtitle: 'Monitore áreas ativas',
      icon: <ChartArea className={itemIconSizing} />,
      linkTo: '/controleSafra',
    },
    {
      title: 'Gerenciamento de Área',
      subtitle: 'Organize suas propriedades',
      icon: <MapPin className={itemIconSizing} />,
      linkTo: '/gerenciamentoArea',
    },
    {
      title: 'Histórico de Safras',
      subtitle: 'Consulte Safras anteriores',
      icon: <History className={itemIconSizing} />,
      linkTo: '/historicoSafra',
    },
    {
      title: 'Relatórios',
      subtitle: 'Análises',
      icon: <FileText className={itemIconSizing} />,
      linkTo: '/relatorios',
    },
  ];

  return (
    <div className="sm:max-w-xl mx-auto">
      <HomeHeaderTitle />
      <div className="p-3 gap-3 items-center flex flex-wrap justify-around">
        {homeItems.map((item) => {
          return (
            <HomeCard
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              linkTo={item.linkTo}
            />
          );
        })}
      </div>
    </div>
  );
}
