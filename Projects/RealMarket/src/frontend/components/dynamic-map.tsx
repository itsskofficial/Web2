import dynamic from 'next/dynamic';
import { Skeleton } from '@components/ui/skeleton';

const DynamicMap = dynamic(() => import('./map-component'), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full" />,
});

export default DynamicMap;