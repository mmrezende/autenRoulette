import React from 'react';

import '../styles/Card.css';

const Component = ({imgSrc, imgAlt, amount, text}) => {
    return (
        <div className='card relative'>
            <img src={imgSrc} alt={imgAlt}/>
            <div>
                <hgroup className='verticalAlign'>
                    <h1>{amount}</h1>
                    <h2>{text}</h2>
                </hgroup>
            </div>
        </div>
    );
}

export default Component;