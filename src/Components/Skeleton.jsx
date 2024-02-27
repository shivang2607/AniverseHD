import React from 'react'
import styles from '@/styles/Skeleton.module.css'

const Skeleton = ({number}) => {

   
  return (
    <div className={styles.card} >
  {/* <div className={`${styles.card__skeleton} ${styles.card__title}`} ></div> */}
  
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  <div className={`${styles.card__skeleton} ${styles.card__description}`}></div>
  
    </div>
  )
}

export default Skeleton