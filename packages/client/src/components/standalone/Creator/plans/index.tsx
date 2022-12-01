import type { Product } from '@contracts';
import { useEffect, useState } from 'react';

import { useCreatorContract } from '@/hooks/useCreatorContract';

type PlansProps = {
  contractAddress: string;
  editable: boolean;
};

export const Plans = ({ contractAddress, editable }: PlansProps) => {
  const contract = useCreatorContract(contractAddress);

  const [plans, setPlans] = useState<Product.PlanStructOutput[]>([]);

  useEffect(() => {
    if (!contract) return;
    contract.getAllPlans().then(setPlans);
  }, [contract]);

  return <div></div>;
};
