interface IUserData {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
}

interface IConfig {
    apiUrl: string;
    timeout: number;
}

class IDataService {
    getData(): IUserData[] {
        return [];
    }
}

export { IUserData, IConfig, IDataService };
