const getStatusLabel = (status: string, isActive: boolean, hasPermission: boolean): string => {
    return status === 'pending'
        ? 'Waiting'
        : status === 'active'
          ? isActive
              ? 'Active and running'
              : 'Active but stopped'
          : status === 'disabled'
            ? hasPermission
                ? 'Disabled but accessible'
                : 'Disabled and locked'
            : 'Unknown';
};

const getPriority = (level: number, urgent: boolean, important: boolean): string => {
    return level > 5 ? (urgent ? 'Critical' : important ? 'High' : 'Medium') : level > 2 ? 'Low' : 'Minimal';
};

export { getStatusLabel, getPriority };
