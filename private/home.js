const mainContent = document.getElementById('main-content')
const menuItems = document.getElementById('menu-items')

// On load, calls the function that gets list of videos & creates the menu items
window.addEventListener('load', () => {
  createMenu()
})

//Gets all video data for the menu
async function createMenu() {
  try {
    const data = await fetch('/videoData', {
      method: 'GET'
    })

    const jsonResponse = await data.json()
    jsonResponse.map(item => renderMenu(item.name, item.id))
  } catch (error) {
    console.error('error at line 20: ' + error)
  }
}

function renderMenu(itemName, attributeID) {
  const menuItem = document.createElement('p')

  menuItem.innerText = itemName
  menuItem.setAttribute('id', attributeID)

  menuItem.addEventListener('click', (e) => {
    e.preventDefault()
    window.location.href = `/watch/${attributeID}`
    // getTranscript(attributeID)
  })

  menuItems.appendChild(menuItem)
}

//gets the transcription from the database & creates the UI with the video. This is done for a single item from the menu
async function getTranscript(attributeID) {
  const result = await fetch(`/videoData/${attributeID}`, {
      method: 'GET'
    })

  const jsonResponse = await result.json()
  createUI(jsonResponse)
}

function createUI(data) {
  // Always clear the content first
  if (mainContent.children.length > 0) {
    mainContent.innerHTML = '';
  }
  
  const webPath = '/uploads/' + data.path.path.split('/uploads/')[1];

  // Video getting created
  createVideo(webPath);

  // Paragraph creation
  const paragraphs = data.allSentences;
  const allWords = data.allWords;

  let sentenceWord;
  for (const para of paragraphs) {
    sentenceWord = allWords.filter(word => {
      return word.start_time >= para.start_time && word.end_time <= para.end_time;
    });

    const paraDiv = document.createElement('div');
    paraDiv.style.width = 'inherit'
    const videoElement = document.getElementById('video');

    sentenceWord.map(element => {
      const p = document.createElement('p');
      p.innerHTML = element.punctuated_word + '&nbsp;';
      p.setAttribute('startTime', element.start);
      p.setAttribute('endTime', element.start);
      p.addEventListener('click', () => {
        videoElement.currentTime = element.start;
      });
      tagWord(videoElement, p, element);
      paraDiv.appendChild(p);
    });
    
    mainContent.appendChild(paraDiv);
  }
}




























// videoConverter.js
// async function handleVideoConversion() {
//   const fileInput = document.createElement('input');
//   fileInput.type = 'file';
//   fileInput.accept = 'video/*';
//   fileInput.style.display = 'none';

//   fileInput.onchange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       try {
//         const formData = new FormData();
//         formData.append('video', file);

//         const response = await fetch('/convert', {
//           method: 'POST',
//           body: formData
//         });

//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         //logic that appends a new menu item


//         response.json().then(res => {
//           console.log(res)
//           createMenuItem(file.name, res.lastVideoId)
//           createText(res)
//         })

//         //video ops
//         const videoURL = URL.createObjectURL(file);
//         createVideo(videoURL)

//         document.body.removeChild(fileInput);
//       } catch (error) {
//         console.error('Conversion failed:', error);
//         alert('Failed to convert video: ' + error.message);
//       }
//     }
//   };

//   document.body.appendChild(fileInput);
//   fileInput.click();
// }


// Initialize button click handler
document.addEventListener('DOMContentLoaded', () => {
  const convertButton = document.getElementById('convertButton');
  if (convertButton) {
    convertButton.addEventListener('click', handleVideoConversion);
  }
});


//function creates a new video element & appends it
function createVideo(src) {
  const video = document.createElement('video')
  video.setAttribute('id', 'video')
  video.src = src
  video.controls = true;
  mainContent.append(video)
}







function tagWord(videoPlayer, paraElement, currentWord) {
  videoPlayer.addEventListener('play', (e) => {
    setInterval(() => {
      const currentTime = videoPlayer.currentTime;

      if (currentTime > currentWord.start && currentTime < currentWord.end) {
        if (!paraElement.matches(':hover')) {
          paraElement.style.background = 'yellow'
        }
      } else if (currentTime > currentWord.start_time && currentTime < currentWord.end_time) {
        if (!paraElement.matches(':hover')) {
          paraElement.style.background = 'yellow'
        }
      } else {
        if (!paraElement.matches(':hover')) {
          paraElement.style.background = 'transparent';
        }
      }
    }, 100);

  }, 100)
}



// async function createText(data) {
//   const paragraphs = data.result.results.channels[0].alternatives[0].paragraphs.paragraphs
//   const allWords = data.result.results.channels[0].alternatives[0].words


//   for (const para of paragraphs) {
//     const allSentences = para.sentences; //get all the sentences

//     allSentences.map(item => {
//       // item returns the singular object from which we can get start & end times
//       let sentenceWord

//       //we're going to loop the all words & then check if items.start matches with the words start & end times
//       for (const word of allWords) {
//         sentenceWord = allWords.filter(word => {
//           return word.start >= item.start && word.end <= item.end;
//         });
//       }

//       const paraDiv = document.createElement('div')
//       const videoElement = document.getElementById('video')

//       sentenceWord.map(element => {
//         const p = document.createElement('p')
//         p.innerHTML = element.punctuated_word + '&nbsp;'
//         p.setAttribute('startTime', element.start)
//         p.setAttribute('endTime', element.start)
//         p.addEventListener('click', () => {
//           videoElement.currentTime = element.start
//         })
//         tagWord(videoElement, p, element)
//         paraDiv.appendChild(p)
//         mainContent.append(paraDiv)
//       })
//     })
//   }
// }