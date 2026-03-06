import type { Route } from './+types/home';
import { Welcome } from '../welcome/welcome';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ComponentExample,
} from '@spareparts/ui';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'New React Router App' },
    { name: 'description', content: 'Welcome to React Router!' },
  ];
}

export default function Home() {
  return (
    <div>
      <ComponentExample />
    </div>
  );
}
