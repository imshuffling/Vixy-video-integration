import { useEffect, useState } from 'react';
import axios from 'axios';
import XMLParser from 'react-xml-parser';
import '@contentful/forma-36-react-components/dist/styles.css';
import '@contentful/forma-36-tokens/dist/css/index.css';
import { Grid, Card, Spinner, Paragraph, Modal, Button, TextField, Icon } from '@contentful/forma-36-react-components';

// TODO 
// CONVERT APP INTO CONTENTFUL UI EXTENSION

const App = () => {

  //https://cors-anywhere.herokuapp.com/
  // let cors = ``
  let startSession = `https://platform.vixyvideo.com/api_v3?secret=7fba2533ad573938cba13c5c0920c92d&userId=david.riches@appnovation.com&type=ADMIN&partnerId=568&expiry=3600&service=session&action=start`;

  const [media, setMedia] = useState(null);
  const [isShown, setShown] = useState(false);
  const [data, setData] = useState('')
  const [searchTerm, setSearchTerm ] = useState('')

  const doReset = () => setSearchTerm('')


  function removeVideo() {
    setData('')
  }

  function getData(event) {
    setData(event)
    setShown(false)
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const responseSession = await axios.get(
          startSession
        )

        // Grabbing reponse data
        const xml = new XMLParser().parseFromString(responseSession.data);
        console.log(xml)
        console.log(xml.getElementsByTagName('result')[0].value);

        // Using response dataGetting Session Key
        let API_KEY = xml.getElementsByTagName('result')[0].value
        let getMediaList = `https://platform.vixyvideo.com/api_v3?format=1&partnerId=568&ks=${API_KEY}&service=media&action=list`;

        console.log(getMediaList)

        const responseMedia = await axios.get(
          getMediaList
        )

        setMedia(responseMedia.data.objects)
        console.log(responseMedia.data.objects)
      } catch (error) {
        console.log(error)
      }
    }
    fetchData()
  }, [])


  if (media){
    return (
      <div style={{'margin': '50px'}}>

      <Button
        onClick={() => {
          setShown(true);
        }}
      >
        Vixy Finder
      </Button>

      <TextField 
        style={{'marginTop': '25px'}}
        width={'large'}
        labelText={'Vixy ID'}
        name="vixyID"
        id="vixyID"
        textInputProps={{
          disabled: true,
        }}
        value={data ? data.id : ''}
        helpText="The Vixy ID will be populated when selecting a video in the modal."
      />

      { data &&
      <>
        <Card style={{'width': '300px', 'marginTop': '10px'}} title={data.name} className="card-selected">
          <Icon icon="Close" size={"medium"} className="close-icon" onClick={() => removeVideo()}>Close</Icon>
          <img style={{ width: '100%' }} alt={data.name} src={data.thumbnailUrl} />
          <Paragraph>{data.name}</Paragraph>
          <Paragraph>ID: {data.id}</Paragraph>
        </Card>
        </>
       } 

      {/* {JSON.stringify(data, 2, null)} */}

      <Modal size={'fullWidth'} title="Vixy Video"
        isShown={isShown}
        onClose={() => {
          setShown(false);
        }}
      >

      <div className="search-bar">
        <TextField 
          style={{'marginBottom': '25px'}}
          width={'large'}
          labelText={'Search'}
          name="searchInput"
          id="searchInput"
          value={searchTerm}
          textInputProps={{
            placeholder: 'Type a video name...',
          }}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
        />
        {searchTerm !== '' &&
          <Icon icon="Close" className="close-icon" onClick={() => doReset()}>Close</Icon>
        }
      </div>

      <Grid columns={5} rowGap={"spacingM"} columnGap={"spacingM"} style={{ width: '90vw' }}>   
      {media.filter((mediaItem) => {
        if (searchTerm === "") {
          return mediaItem
        } else if (mediaItem.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return mediaItem
        }
      }).map((mediaItem, i) => {
          return (
            <Card title={mediaItem.name} key={i} onClick={() => getData(mediaItem)}>
              <img style={{ width: '100%' }} alt={mediaItem.name} src={mediaItem.thumbnailUrl} />
              <Paragraph>{mediaItem.name}</Paragraph>
              <Paragraph>ID: {mediaItem.id}</Paragraph>
              <Button style={{'float':'right'}} buttonType={'primary'} size={'small'} href={mediaItem.downloadUrl} download>Download</Button>
            </Card>
          )
      })}

      </Grid>
    </Modal>
    </div>
    );
  }

  return (
    <div>
      <Spinner color={'primary'} />
    </div>
  )

}

export default App;
