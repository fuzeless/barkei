import logo from './logo.svg';
import styles from './App.module.scss';
import { Button, Form, Modal } from 'react-bootstrap';
import { useState } from 'react';
import PlayerCard from './player-card';

const INIT_PLAYER = {
  score: 0,
  currentScore: 0,
}

const App = () => {
  //* Money-related states
  const [basePrice, setBasePrice] = useState(0);
  const [basePriceInput, setBasePriceInput] = useState('');

  //* Player-related states
  const [players, setPlayers] = useState([]);
  const [debtMaster, setDebtMaster] = useState(null);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [doubleSelectedIds, setDoubleSelectedIds] = useState([]);
  const [nameInput, setNameInput] = useState('');

  const [result, setResult] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);

  //* For debt calculation only
  const [debtScore, setDebtScore] = useState([]);

  const _handleAddPlayer = (e) => {
    e.preventDefault();
    if (nameInput === '') return;
    const player = {
      id: players.length + 1,
      name: nameInput,
      ...INIT_PLAYER
    };
    setPlayers([...players, player]);
    setNameInput('');
  }

  const _isPlayerSelected = (id) => selectedPlayerIds.includes(id);
  const _isPlayerDoubleSelected = (id) => doubleSelectedIds.includes(id)

  const _handleSelectPlayer = (id) => {
    if (!_isPlayerSelected(id) && !_isPlayerDoubleSelected(id)) setSelectedPlayerIds([...selectedPlayerIds, id]);
    if (_isPlayerSelected(id) && !_isPlayerDoubleSelected(id)) {
      const temp = [...selectedPlayerIds];
      temp.splice(selectedPlayerIds.indexOf(id), 1);
      setSelectedPlayerIds(temp);
      setDoubleSelectedIds([...doubleSelectedIds, id]);
    }
    if (_isPlayerDoubleSelected(id)) {
      const temp = [...doubleSelectedIds];
      temp.splice(doubleSelectedIds.indexOf(id), 1);
      setDoubleSelectedIds(temp);
    }
  }

  const _handleProcessSelectedPlayers = (type, subType) => {
    if (type === 'debtmaster') {
      setDebtMaster(players.find(player => player.id === selectedPlayerIds[0]))
      setSelectedPlayerIds([]);
      setDoubleSelectedIds([]);
      return;
    };
    if (type === 'allwin') {
      setPlayers(players.map(player => ({
        ...player,
        currentScore: (() => {
          if (player.id === debtMaster?.id) return player.currentScore;
          return player.currentScore + basePrice
        })()
      })))
      return;
    }
    if (type === 'alllose') {
      setPlayers(players.map(player => ({
        ...player,
        currentScore: (() => {
          if (player.id === debtMaster?.id) return player.currentScore;
          return player.currentScore - basePrice
        })()
      })))
      return;
    }
    if (type === 'debtmasterwin') {
      setPlayers(players.map(player => ({
        ...player,
        currentScore: (() => {
          if (player.id === debtMaster?.id) return player.currentScore;
          return player.currentScore - basePrice * 2
        })()
      })))
      return;
    }
    setPlayers(players.map(player => ({
      ...player,
      currentScore: (() => {
        //* If player is Debt Master, keep currentScore
        if (player.id === debtMaster?.id) return player.currentScore;
        //* If player is doubly selected, double their basePrice.
        if (_isPlayerDoubleSelected(player.id)) {
          if (type === 'win') return player.currentScore + basePrice * 2;
          if (type === 'lose') return player.currentScore - basePrice * 2;
        } else if (_isPlayerSelected(player.id)) {
          if (type === 'win') return player.currentScore + basePrice;
          if (type === 'lose') return player.currentScore - basePrice;
        } else {
          if (type === 'win') return player.currentScore - basePrice;
          if (type === 'lose') return player.currentScore + basePrice;
        }
      })()
    })));
    setSelectedPlayerIds([]);
    setDoubleSelectedIds([]);
  }

  const _handleNextRound = () => {
    const debtList = players.map(player => ({
      id: player.id,
      name: player.name,
      debt: -player.currentScore,
    }));
    const tempResult = {
      id: debtMaster.id,
      debtMasterName: debtMaster.name,
      debtList,
    }
    setResult([...result, tempResult]);
    const tempPlayers = players.map(player => ({
      ...player,
      score: player.score + player.currentScore,
      currentScore: 0,
    }))
    let debtMasterScore = tempPlayers[tempPlayers.findIndex(player => player.id === debtMaster.id)].score;
    debtList.forEach(player => {
      debtMasterScore += player.debt;
    });
    tempPlayers[tempPlayers.findIndex(player => player.id === debtMaster.id)].score = debtMasterScore;
    const tempDebtScore = debtList.map(player => ({
      ...player,
      debt: -player.debt,
    }));
    debtMasterScore = 0;
    debtList.forEach(player => {
      debtMasterScore += player.debt;
    });
    tempDebtScore[tempDebtScore.findIndex(p => p.id === debtMaster.id)].debt = debtMasterScore;
    setDebtScore([...debtScore, ...tempDebtScore])
    setPlayers(tempPlayers);
    setDebtMaster(null);
  }

  const _handleSetBasePrice = (e) => {
    e.preventDefault();
    setBasePrice(parseInt(basePriceInput));
    console.log(e);
  }

  return (
    <div className={styles.barkeiContainer}>
      <Form onSubmit={_handleAddPlayer}>
        <Form.Control
          size="lg"
          type="text"
          placeholder='Nhập tên'
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
      </Form>
      {
        !basePrice
          ? (
            <Form onSubmit={_handleSetBasePrice}>
              <Form.Control
                size="lg"
                type="number"
                placeholder='Nhập tiền cược'
                value={basePriceInput}
                onChange={(e) => setBasePriceInput(e.target.value)}
              />
            </Form>
          )
          : (
            <div>{`Mệnh giá cược: ${basePrice}`}</div>
          )
      }
      <br />
      <div className={styles.playersContainer}>
        {
          players.map(player => (
            <PlayerCard
              name={player.name}
              id={player.id}
              totalScore={player.score}
              currentScore={player.currentScore}
              isSelected={_isPlayerSelected(player.id)}
              isDoubleSelected={_isPlayerDoubleSelected(player.id)}
              isDebtMaster={player.id === debtMaster?.id}
              handleSelectPlayer={() => _handleSelectPlayer(player.id)}
            />
          ))
        }
      </div>
      <br />
      {
        debtMaster
          ? (
            <>
              <div className={styles.controlContainer}>
                <Button variant="outline-light" onClick={() => _handleProcessSelectedPlayers('win')}>
                  Thắng
                </Button>
                <Button variant="outline-danger" onClick={() => _handleProcessSelectedPlayers('lose')}>
                  Thua
                </Button>
                <Button variant="outline-warning" onClick={() => _handleProcessSelectedPlayers('allwin')}>
                  Cả làng thắng
                </Button>
                <Button variant="outline-warning" onClick={() => _handleProcessSelectedPlayers('alllose')}>
                  Cả làng thua
                </Button>
                <Button variant="outline-light" onClick={() => _handleProcessSelectedPlayers('debtmasterwin')}>
                  Chương được 10
                </Button>
              </div>
              <br />
              <Button onClick={_handleNextRound}>
                Chuyển chương
              </Button>
            </>
          )
          : (
            <Button
              variant="outline-warning"
              onClick={() => _handleProcessSelectedPlayers('debtmaster')}
            >
              Chọn nhà cái
            </Button>
          )
      }
      <br />
      <div className={styles.resultButton} onClick={() => setShowResultModal(true)}>
        Xem kết quả
      </div>
      <Modal show={showResultModal} size="lg" centered onHide={() => setShowResultModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Kết quả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className={styles.resultTable}>
            <tr>
              <th />
              <th>Tổng ăn</th>
              <th>Tổng thua</th>
              <th>Δ</th>
            </tr>
            {
              players.map(player => {
                let totalWin = 0, totalLoss = 0;
                const playerScore = debtScore.filter(p => p.id === player.id);
                console.log(playerScore);
                playerScore.forEach(p => {
                  if (p.debt > 0) totalWin += p.debt;
                  else totalLoss += -p.debt;
                })
                return (
                  <tr>
                    <td>{player.name}</td>
                    <td>{totalWin}</td>
                    <td>{totalLoss}</td>
                    <td>{totalWin - totalLoss}</td>
                  </tr>
                )
              })
            }
          </table>
        </Modal.Body>
      </Modal>
    </div >
  );
}

export default App;
