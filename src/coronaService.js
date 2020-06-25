export const fetchCoronaLiveData = async () => {
    const data = await fetch("https://api.covid19api.com/total/dayone/country/brazil/status/deaths").then(r => r.json());

    return data.map(d => ({
        total: d.Cases,
        date: d.Date
    }));
}