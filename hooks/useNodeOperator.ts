/**
 * useNodeOperator Hook
 * Finds the operator (manager) for a given node ID
 */

import { useMemo } from 'react';
import { useOperators, Operator } from './useOperators';

interface UseNodeOperatorResult {
    operator: Operator | null;
    isLoading: boolean;
}

interface UseNodeOperatorParams {
    nodeId?: string;
    publicKey?: string | null;
}

export function useNodeOperator({ nodeId, publicKey }: UseNodeOperatorParams): UseNodeOperatorResult {
    const { data: operatorsResponse, isLoading } = useOperators();

    const operator = useMemo(() => {
        if (!operatorsResponse?.data) return null;

        const targets = [publicKey, nodeId].filter((value): value is string => Boolean(value));
        if (targets.length === 0) return null;

        return operatorsResponse.data.find(op =>
            op.pnodeIds.some(id => targets.includes(id))
        ) || null;
    }, [nodeId, publicKey, operatorsResponse?.data]);

    return { operator, isLoading };
}
