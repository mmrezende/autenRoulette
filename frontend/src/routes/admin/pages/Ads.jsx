import React, {useState, useEffect} from 'react';

import '../styles/Ads.css';

import {editIcon, removeIcon, flag} from '../assets';

import Background from '../components/Background';
import Header from '../components/Header';
import Card from '../components/Card';

import {formatDate, formatLocationFilter, getData, imgUrl} from '../utils';
import {getAds} from '../queries/get';
import {deleteAd} from '../queries/del';

const Page = ({setCurrentPage, setSelectedAd, credentials}) => {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        getData({
            method: () => getAds(credentials),
            setter: setAds
        });
        setSelectedAd(null);
    },[credentials, setSelectedAd]);

    const removeAd = async (ad) => {
        const success = await deleteAd({...credentials, id: ad.id});
        if(success) {
            const index = ads.indexOf(ad);
            const removed = (ads.slice(0,index)).concat(ads.slice(index+1,ads.length));

            return setAds(removed);
        }
    }

    const cards = {
        publishedAds: {amount: ads.length, text: 'Anúncios Publicados'},
    }

    const AdCard = ({ad}) => {
        const location = formatLocationFilter(ad.locationFilter);
        return (
            <div className='adCard horizontalAlign'>
                <div className='verticalAlign'>                    
                    <button>
                        <img src={removeIcon} alt='Ícone de lixeira indicando remoção'
                            onClick={() => {
                                const answer = window.confirm(`Tem certeza que quer remover o anúncio da empresa ${ad.companyName}?`);
                                if(answer) removeAd(ad);    
                            }}/>
                    </button>
                    <button
                        onClick={() => {
                            const locationFilter = JSON.parse(ad.locationFilter);
                            setSelectedAd({...ad,
                                selectedStates: locationFilter.states,
                                selectedCities: locationFilter.cities
                            });
                            console.log({...ad,
                                selectedStates: locationFilter.states,
                                selectedCities: locationFilter.cities
                            });
                            setCurrentPage('createAd');
                        }}
                    >
                        <img src={editIcon} alt='Ícone de lápis indicando edição'/>
                    </button>
                </div>
                <div className='verticalAlign'><h3 className='bold'>Empresa:</h3><h3>{ad.companyName}</h3></div>
                <div>
                    <h3 className='bold'>Localização:</h3>
                    <div>
                        <h3 className='alignLeft'>Estados: {location[0]}</h3>
                        <h3 className='alignLeft'>Cidades: {location[1]}</h3>
                    </div>
                </div>
                <div className='verticalAlign'><h3 className='bold'>Link:</h3><a href={ad.linkURL} target='_blank' rel='noreferrer'>{ad.linkURL}</a></div>
                <div className='verticalAlign adDuration'><h3 className='bold'>Tempo de exibição:</h3><h3>{`de ${formatDate(ad.initialDateTime)} até ${formatDate(ad.expirationDateTime)}`}</h3></div>
                <div className='horizontalAlign' style={{width: '100%'}}>
                    <img 
                        className='adBanner' 
                        src={imgUrl(ad.imgFileName)}
                        alt={`Banner do anúncio da empresa ${ad.companyName}`}
                    />
                </div>
            </div>
        )
    }

    const Table = ({items}) => {
        let rows = [];
        for (let i=0; i<items.length;i+=3) {
            rows.push(items.slice(i,i+3));
        }

        return(
            <div className='table'>
                {rows.map((row, index) => {
                    return(
                        <div key={index} className='row'>
                            {row.map((ad, index) =><div key={index} className='item'><AdCard ad={ad}/></div>)}
                        </div>
                    );
                })}
            </div>
        );
    }
    return (
        <Background id={'ads'}>
            <Header setCurrentPage={setCurrentPage}/>
            <main>
                <div className='verticalAlign pageTitle relative'>
                    <h1>Anúncios</h1>
                    <div>
                        <input type='submit' value='Publicar novo anúncio'
                            onClick={() => {
                                setSelectedAd(null);
                                setCurrentPage('createAd');
                            }}
                        />
                    </div>
                </div>
                <div className='verticalAlign'>
                    <Card imgSrc={flag} imgAlt={'Ícone colorido de bandeira'} {...cards.publishedAds}/>
                </div>
                {ads.length>0 && <Table items={ads}/>}
            </main>
        </Background>
    );
}

export default Page;