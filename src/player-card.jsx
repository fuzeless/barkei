import React from 'react';
import { Button } from 'react-bootstrap';
import styles from './player-card.module.scss';

const PlayerCard = ({
  name,
  id,
  totalScore,
  currentScore,
  isSelected,
  isDoubleSelected,
  isDebtMaster,
  handleSelectPlayer,
}) => {
  return (
    <div className={`${styles.cardContainer} ${isDebtMaster && styles['cardContainer__debtMaster']}`} onClick={handleSelectPlayer}>
      <div className={`${styles.name} ${isSelected && styles['name__selected']} ${isDoubleSelected && styles['name__doubleSelected']}`}>
        {name}
      </div>
      {
        !isDebtMaster && (
          <>
            <div className={styles.totalScore}>{`Tổng tiền: ${totalScore}`}</div>
            <div className={styles.currentScore}>{`Tiền ván này: ${currentScore}`}</div>
          </>
        )
      }
      <div>
        {isDebtMaster}
      </div>
    </div>
  )
};

export default PlayerCard;
