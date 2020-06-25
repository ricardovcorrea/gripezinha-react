import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import moment from 'moment';

import { fetchCoronaLiveData } from './coronaService';

import person from './assets/images/person.png';
import personRed from './assets/images/person_red.png';
import git from './assets/images/git.png';

const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [coronaData, setCoronaData] = useState([]);
  const [averageDeathsPerMinute, setAverageDeathsPerMinute] = useState(0);
  const [averageIntervalBetweenDeaths, setAverageIntervalBetweenDeaths] = useState(0);
  const [timeoutSeconds, setTimeoutSeconds] = useState(0);
  const [todayEstimated, setTodayEstimated] = useState(0);
  const [totalEstimatedSinceOpening, setTotalEstimatedSinceOpening] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);

  const intervalRef = useRef();

  const moreInfoRef = useRef();
  const scrollToMoreInfo = () => scrollToRef(moreInfoRef)

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = await fetchCoronaLiveData();
    setIsLoading(false);

    const last8daysWithData = data.reverse().slice(1, 9);
    setTotalDeaths(last8daysWithData[0].total);

    const totalsOfLast7days = [];

    for (let i = 0; i <= 8; i++) {
      const totalOfDay = last8daysWithData[i];

      if (i + 1 < 8) {
        const totalOfDayBefore = last8daysWithData[i + 1];

        totalsOfLast7days.push({
          date: moment(totalOfDay.date).format("DD/MM/YYYY"),
          total: totalOfDay.total - totalOfDayBefore.total
        });
      }
    }

    const sevenDaysInMinutes = 7 * 24 * 60;

    const averageDeathsPerMinute = (totalsOfLast7days.map(d => d.total).reduce((prev, act) => prev + act, 0) / sevenDaysInMinutes).toFixed(2);
    setAverageDeathsPerMinute(averageDeathsPerMinute);

    const secondsBetweenDeaths = (60 / averageDeathsPerMinute).toFixed(0);
    setAverageIntervalBetweenDeaths(secondsBetweenDeaths);
    startCountdown(secondsBetweenDeaths);

    const totalSecondsToday = moment().diff(moment(moment().startOf('day')), 'seconds');
    const today = Number.parseInt((totalSecondsToday / secondsBetweenDeaths).toFixed(0));

    setTodayEstimated(today);

    setCoronaData(totalsOfLast7days);
  }

  const startCountdown = (secondsBetweenDeaths) => {
    setTimeoutSeconds(secondsBetweenDeaths);

    intervalRef.current = setInterval(() => {
      setTimeoutSeconds(timeoutSeconds => timeoutSeconds - 1);
    }, 1000);
  }

  useEffect(() => {
    if (timeoutSeconds === -1) {
      setTodayEstimated(setTodayEstimated => setTodayEstimated + 1);
      setTotalEstimatedSinceOpening(totalEstimatedSinceOpening => totalEstimatedSinceOpening + 1);
      setTimeoutSeconds(averageIntervalBetweenDeaths);
    }
  }, [timeoutSeconds]);

  return (
    <div className="App">
      <a className="moreInfo" href="#mais-informacoes" onClick={() => {
        scrollToMoreInfo();
      }}>Mais informações</a>
      <a className="dataSource" href="https://covid19api.com/">Dados (https://covid19api.com)</a>
      <div className="header" style={{marginTop: 50}}>
        <h1>Só uma gripezinha ...</h1>
        {!isLoading && <>
          <h2 style={{ marginTop: -15 }}>1 morte a cada <span style={{ color: 'red' }}>{averageIntervalBetweenDeaths}</span> segundos</h2>
          <span className="countdown">{timeoutSeconds}</span>
        </>}

        {isLoading && <div className="loader"></div>}

      </div>

      {!isLoading && <>
        <div>
          <div className="header">
            <h1>Só hoje <span style={{ color: 'red' }}>{todayEstimated}</span> mortes</h1>
            <h3 style={{ marginTop: -15 }}><span style={{ color: 'red' }}>{totalEstimatedSinceOpening} </span> desde a abertura desta página</h3>
          </div>
          <div>
            {[...Array(todayEstimated)].map((e, i) => (
              <>
                {i < totalEstimatedSinceOpening && <img src={personRed} className="personIcon" />}
                {i > totalEstimatedSinceOpening && <img src={person} className="personIcon" />}
              </>
            ))}
          </div>
        </div>

        <div className="header">
          <h3>Total de mortes nos ultimos 7 dias</h3>
          <h1><span style={{ color: 'red' }}>{coronaData.map(d => d.total).reduce((prev, act) => prev + act, 0)}</span></h1>
          <h3>Média de mortes por minuto nos ultimos 7 dias</h3>
          <h1><span style={{ color: 'red' }}>{averageDeathsPerMinute}</span></h1>
        </div>

        <div>
          {[...Array(coronaData.map(d => d.total).reduce((prev, act) => prev + act, 0))].map(() => (
            <img src={person} className="personIcon" />
          ))}
        </div>

        <div className="header" ref={moreInfoRef}>
          <h3 className="notJustAFlu">Total de mortes no Brasil</h3>
          <h1><span className="notJustAFlu" style={{ color: 'red' }}>{totalDeaths}</span></h1>
        </div>

        <div className="header" style={{ marginTop: 30 }} >
          <div style={{ marginBottom: 30 }}>
            <h1 className="notJustAFlu">Não é só uma gripezinha.</h1>

            <div class="video-container">
              <iframe src="https://www.youtube.com/embed/KOXNBA9b86I" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
            <br />
            <br />
            <a href="https://coronavirus.saude.gov.br/" target="_blank">https://coronavirus.saude.gov.br/</a>
            <br />
            <br />
            <a href="http://gripezinha.com.br/" target="_blank">http://gripezinha.com.br/</a>
            <br />
            <br />
            <a href="http://gripezinha.com/" target="_blank">http://gripezinha.com/</a>
          </div>

          <a href="https://github.com/ricardovcorrea/gripezinha">
            <img src={git} className="git" />
          </a>

        </div>

      </>}

    </div >
  );
}

export default App;
