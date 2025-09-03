export interface User {
    id?: string; // Spotify user ID
    username: string;
    country: string; // flag emoji
    artists: string[];
    songs: string[];
    genres: string[];
    similarUsers?: SimilarUser[];
}

export interface SimilarUser {
    username: string;
    compatibility: number; // percentage
    commonArtists: string[];
    commonSongs: string[];
    commonGenres: string[];
}

export interface SimilarityResult {
    user: User;
    compatibility: number;
    commonArtists: string[];
    commonSongs: string[];
    commonGenres: string[];
    description: string;
}

export const MOCK_USERS: User[] = [
    {
        username: "jadenbruh",
        country: "🇺🇸",
        artists: ["Steve Lacy", "Kali Uchis", "Tyler, The Creator", "Frank Ocean", "Blood Orange", "SZA", "Anderson .Paak", "Childish Gambino", "Solange", "The Internet"],
        songs: ["Bad Habit - Steve Lacy", "Telepatía - Kali Uchis", "See You Again - Tyler, The Creator", "Pink + White - Frank Ocean", "You're Not Good Enough - Blood Orange", "The Weekend - SZA", "Come Down - Anderson .Paak", "Redbone - Childish Gambino", "Cranes in the Sky - Solange", "Girl - The Internet"],
        genres: ["neo soul", "r&b", "alternative r&b", "funk", "indie r&b", "bedroom pop", "hip hop soul", "chillwave", "soul", "lo-fi r&b"]
    },
    {
        username: "margielamango",
        country: "🇺🇸",
        artists: ["A$AP Rocky", "Playboi Carti", "Yeat", "Ken Carson", "Destroy Lonely", "Lil Uzi Vert", "Travis Scott", "Don Toliver", "Future", "Metro Boomin"],
        songs: ["L$D - A$AP Rocky", "Magnolia - Playboi Carti", "Monëy so big - Yeat", "Yale - Ken Carson", "Bane - Destroy Lonely", "XO TOUR Llif3 - Lil Uzi Vert", "Goosebumps - Travis Scott", "After Party - Don Toliver", "Mask Off - Future", "Superhero - Metro Boomin"],
        genres: ["trap", "cloud rap", "plugg", "rage rap", "southern hip hop", "psychedelic rap", "pop rap", "drill", "experimental hip hop", "atlanta rap"]
    },
    {
        username: "lilyanarose",
        country: "🇺🇸",
        artists: ["Lana Del Rey", "Florence + The Machine", "Hozier", "Mitski", "Phoebe Bridgers", "The National", "Bon Iver", "Aurora", "Fleetwood Mac", "Mazzy Star"],
        songs: ["West Coast - Lana Del Rey", "Shake It Out - Florence + The Machine", "Take Me to Church - Hozier", "Nobody - Mitski", "Motion Sickness - Phoebe Bridgers", "I Need My Girl - The National", "Holocene - Bon Iver", "Runaway - Aurora", "Dreams - Fleetwood Mac", "Fade Into You - Mazzy Star"],
        genres: ["indie folk", "dream pop", "baroque pop", "folk rock", "art pop", "alternative folk", "soft rock", "indie rock", "ethereal wave", "singer-songwriter"]
    },
    {
        username: "v8q",
        country: "🇺🇸",
        artists: ["Aphex Twin", "Boards of Canada", "Four Tet", "Burial", "Autechre", "Squarepusher", "Floating Points", "Jamie xx", "Caribou", "Tycho"],
        songs: ["Avril 14th - Aphex Twin", "Dayvan Cowboy - Boards of Canada", "Two Thousand and Seventeen - Four Tet", "Archangel - Burial", "Eutow - Autechre", "My Red Hot Car - Squarepusher", "Silhouettes - Floating Points", "Loud Places - Jamie xx", "Odessa - Caribou", "Awake - Tycho"],
        genres: ["idm", "ambient", "downtempo", "glitch", "future garage", "electronica", "chillout", "experimental", "deep house", "trip hop"]
    },
    {
        username: "homixidegang",
        country: "🇺🇸",
        artists: ["Chief Keef", "Lil Durk", "G Herbo", "King Von", "Polo G", "Lil Bibby", "Fredo Santana", "Lil Reese", "Tay-K", "21 Savage"],
        songs: ["Love Sosa - Chief Keef", "AHHH HA - Lil Durk", "PTSD - G Herbo", "Crazy Story - King Von", "Rapstar - Polo G", "Water - Lil Bibby", "Jealous - Fredo Santana", "Us - Lil Reese", "The Race - Tay-K", "a lot - 21 Savage"],
        genres: ["drill", "trap", "chicago drill", "gangsta rap", "southern hip hop", "hardcore hip hop", "street rap", "midwest rap", "trap drill", "drill wave"]
    },
    {
        username: "peggyfandom",
        country: "🇺🇸",
        artists: ["JPEGMAFIA", "Danny Brown", "Death Grips", "Run The Jewels", "Earl Sweatshirt", "MF DOOM", "BROCKHAMPTON", "Denzel Curry", "Vince Staples", "Open Mike Eagle"],
        songs: ["1539 N. Calvert - JPEGMAFIA", "Ain't It Funny - Danny Brown", "Get Got - Death Grips", "Legend Has It - Run The Jewels", "Chum - Earl Sweatshirt", "Doomsday - MF DOOM", "BLEACH - BROCKHAMPTON", "ULT - Denzel Curry", "Norf Norf - Vince Staples", "Ziggy Starfish - Open Mike Eagle"],
        genres: ["experimental hip hop", "abstract hip hop", "alternative hip hop", "industrial hip hop", "lo-fi hip hop", "boom bap", "conscious hip hop", "trap", "noise rap", "glitch hop"]
    },
    {
        username: "sunsetvinyl",
        country: "🇺🇸",
        artists: ["Mac DeMarco", "Tame Impala", "Mild High Club", "King Krule", "Unknown Mortal Orchestra", "Men I Trust", "Clairo", "Rex Orange County", "Cuco", "Boy Pablo"],
        songs: ["Chamber of Reflection - Mac DeMarco", "The Less I Know The Better - Tame Impala", "Homage - Mild High Club", "Easy Easy - King Krule", "Hunnybee - UMO", "Show Me How - Men I Trust", "Bags - Clairo", "Loving Is Easy - Rex Orange County", "Lo Que Siento - Cuco", "Dance, Baby! - Boy Pablo"],
        genres: ["indie pop", "psychedelic pop", "bedroom pop", "lo-fi", "chillwave", "dream pop", "soft rock", "alt pop", "indie rock", "surf pop"]
    },
    {
        username: "countrycore",
        country: "🇺🇸",
        artists: ["Kacey Musgraves", "Chris Stapleton", "Maren Morris", "Luke Combs", "Miranda Lambert", "Sturgill Simpson", "Eric Church", "Carrie Underwood", "Morgan Wallen", "Zac Brown Band"],
        songs: ["Rainbow - Kacey Musgraves", "Tennessee Whiskey - Chris Stapleton", "The Bones - Maren Morris", "Beautiful Crazy - Luke Combs", "Bluebird - Miranda Lambert", "Turtles All the Way Down - Sturgill Simpson", "Springsteen - Eric Church", "Before He Cheats - Carrie Underwood", "Wasted On You - Morgan Wallen", "Chicken Fried - Zac Brown Band"],
        genres: ["country", "alt country", "country pop", "americana", "country rock", "modern country", "nashville sound", "folk", "roots", "country soul"]
    },
    {
        username: "punkspirit",
        country: "🇺🇸",
        artists: ["Green Day", "The Offspring", "Blink-182", "Paramore", "My Chemical Romance", "Sum 41", "Fall Out Boy", "All Time Low", "Simple Plan", "Good Charlotte"],
        songs: ["Basket Case - Green Day", "The Kids Aren't Alright - The Offspring", "All The Small Things - Blink-182", "Misery Business - Paramore", "Welcome to the Black Parade - MCR", "Fat Lip - Sum 41", "Sugar, We're Goin Down - Fall Out Boy", "Dear Maria, Count Me In - All Time Low", "I'm Just a Kid - Simple Plan", "The Anthem - Good Charlotte"],
        genres: ["pop punk", "punk rock", "emo", "alternative rock", "skate punk", "post-hardcore", "power pop", "emo pop", "punk revival", "alt emo"]
    },
    {
        username: "jazzedup",
        country: "🇺🇸",
        artists: ["Miles Davis", "John Coltrane", "Herbie Hancock", "Chet Baker", "Bill Evans", "Thelonious Monk", "Ella Fitzgerald", "Louis Armstrong", "Duke Ellington", "Charles Mingus"],
        songs: ["So What - Miles Davis", "Giant Steps - John Coltrane", "Cantaloupe Island - Herbie Hancock", "My Funny Valentine - Chet Baker", "Waltz for Debby - Bill Evans", "Round Midnight - Thelonious Monk", "Summertime - Ella Fitzgerald", "What a Wonderful World - Louis Armstrong", "Take the 'A' Train - Duke Ellington", "Goodbye Pork Pie Hat - Charles Mingus"],
        genres: ["jazz", "bebop", "cool jazz", "modal jazz", "vocal jazz", "jazz fusion", "swing", "hard bop", "post-bop", "classic jazz"]
    },
    {
        username: "metalmorph",
        country: "🇺🇸",
        artists: ["Metallica", "Slipknot", "Tool", "System of a Down", "Pantera", "Megadeth", "Lamb of God", "Avenged Sevenfold", "Mastodon", "Deftones"],
        songs: ["Master of Puppets - Metallica", "Duality - Slipknot", "Schism - Tool", "Chop Suey! - SOAD", "Walk - Pantera", "Holy Wars - Megadeth", "Laid to Rest - Lamb of God", "Bat Country - Avenged Sevenfold", "Oblivion - Mastodon", "Change - Deftones"],
        genres: ["metal", "thrash metal", "nu metal", "progressive metal", "groove metal", "alternative metal", "heavy metal", "metalcore", "hard rock", "post-metal"]
    },
    {
        username: "popstalgia",
        country: "🇺🇸",
        artists: ["Taylor Swift", "Ariana Grande", "Billie Eilish", "Dua Lipa", "Selena Gomez", "Katy Perry", "Lady Gaga", "Olivia Rodrigo", "Doja Cat", "Miley Cyrus"],
        songs: ["Blank Space - Taylor Swift", "thank u, next - Ariana Grande", "bad guy - Billie Eilish", "Levitating - Dua Lipa", "Lose You To Love Me - Selena Gomez", "Firework - Katy Perry", "Poker Face - Lady Gaga", "drivers license - Olivia Rodrigo", "Say So - Doja Cat", "Wrecking Ball - Miley Cyrus"],
        genres: ["pop", "dance pop", "electropop", "teen pop", "alt pop", "synthpop", "pop rock", "indie pop", "contemporary pop", "mainstream pop"]
    },
    {
        username: "edmcloud",
        country: "🇺🇸",
        artists: ["Skrillex", "Porter Robinson", "Madeon", "ZHU", "RL Grime", "Flume", "Illenium", "Seven Lions", "Rezz", "Alison Wonderland"],
        songs: ["Bangarang - Skrillex", "Shelter - Porter Robinson & Madeon", "Faded - ZHU", "Stay For It - RL Grime", "Never Be Like You - Flume", "Good Things Fall Apart - Illenium", "Rush Over Me - Seven Lions", "Edge - Rezz", "Church - Alison Wonderland", "Language - Porter Robinson"],
        genres: ["edm", "future bass", "dubstep", "electro house", "trap", "progressive house", "melodic dubstep", "bass music", "dance", "indietronica"]
    },
    {
        username: "soulsearch",
        country: "🇺🇸",
        artists: ["Alicia Keys", "John Legend", "Adele", "Sam Smith", "Leon Bridges", "Jorja Smith", "H.E.R.", "Daniel Caesar", "Emily King", "Gallant"],
        songs: ["If I Ain't Got You - Alicia Keys", "All of Me - John Legend", "Someone Like You - Adele", "Stay With Me - Sam Smith", "Coming Home - Leon Bridges", "Blue Lights - Jorja Smith", "Best Part - Daniel Caesar", "Remind Me - Emily King", "Weight in Gold - Gallant", "Focus - H.E.R."],
        genres: ["soul", "r&b", "neo soul", "pop soul", "contemporary r&b", "blue-eyed soul", "indie soul", "alt r&b", "urban contemporary", "modern soul"]
    },
    {
        username: "altwave",
        country: "🇺🇸",
        artists: ["Arctic Monkeys", "The Strokes", "Vampire Weekend", "Foals", "The 1975", "Two Door Cinema Club", "Cage The Elephant", "Foster The People", "MGMT", "Phoenix"],
        songs: ["Do I Wanna Know? - Arctic Monkeys", "Last Nite - The Strokes", "A-Punk - Vampire Weekend", "My Number - Foals", "Love It If We Made It - The 1975", "What You Know - TDCC", "Cigarette Daydreams - Cage The Elephant", "Pumped Up Kicks - Foster The People", "Electric Feel - MGMT", "Lisztomania - Phoenix"],
        genres: ["indie rock", "garage rock", "alt rock", "post-punk", "dance punk", "indie pop", "new wave", "synthpop", "britpop", "modern rock"]
    },
    {
        username: "lofitapes",
        country: "🇺🇸",
        artists: ["Joji", "beabadoobee", "mxmtoon", "keshi", "Powfu", "RINI", "Shiloh Dynasty", "Jeremy Zucker", "Conan Gray", "Cavetown"],
        songs: ["SLOW DANCING IN THE DARK - Joji", "Coffee - beabadoobee", "prom dress - mxmtoon", "right here - keshi", "death bed - Powfu", "My Favorite Clothes - RINI", "Lost - Shiloh Dynasty", "comethru - Jeremy Zucker", "Heather - Conan Gray", "This Is Home - Cavetown"],
        genres: ["lo-fi", "bedroom pop", "indie pop", "chillhop", "sad rap", "soft pop", "alt r&b", "emo pop", "indie folk", "lo-fi beats"]
    },
    {
        username: "synthdream",
        country: "🇺🇸",
        artists: ["CHVRCHES", "M83", "Passion Pit", "Empire of the Sun", "Grimes", "Purity Ring", "The Naked and Famous", "St. Lucia", "Future Islands", "Roosevelt"],
        songs: ["The Mother We Share - CHVRCHES", "Midnight City - M83", "Sleepyhead - Passion Pit", "Walking on a Dream - Empire of the Sun", "Oblivion - Grimes", "Fineshrine - Purity Ring", "Young Blood - The Naked and Famous", "Elevate - St. Lucia", "Seasons - Future Islands", "Fever - Roosevelt"],
        genres: ["synthpop", "dream pop", "electropop", "indietronica", "alt pop", "new wave", "chillwave", "electronic", "pop", "dance"]
    },
    {
        username: "blueshaze",
        country: "🇺🇸",
        artists: ["B.B. King", "Stevie Ray Vaughan", "Eric Clapton", "John Mayer", "Gary Clark Jr.", "Joe Bonamassa", "Buddy Guy", "Susan Tedeschi", "Bonnie Raitt", "Robert Cray"],
        songs: ["The Thrill Is Gone - B.B. King", "Pride and Joy - Stevie Ray Vaughan", "Layla - Eric Clapton", "Gravity - John Mayer", "Bright Lights - Gary Clark Jr.", "Sloe Gin - Joe Bonamassa", "Damn Right, I've Got the Blues - Buddy Guy", "It Hurt So Bad - Susan Tedeschi", "I Can't Make You Love Me - Bonnie Raitt", "Smoking Gun - Robert Cray"],
        genres: ["blues", "blues rock", "electric blues", "modern blues", "soul blues", "contemporary blues", "roots rock", "guitar blues", "classic rock", "americana"]
    },
    {
        username: "folkways",
        country: "🇺🇸",
        artists: ["Bob Dylan", "Simon & Garfunkel", "Joni Mitchell", "Joan Baez", "Nick Drake", "Iron & Wine", "Fleet Foxes", "Sufjan Stevens", "The Tallest Man on Earth", "Bonnie 'Prince' Billy"],
        songs: ["Blowin' in the Wind - Bob Dylan", "The Sound of Silence - Simon & Garfunkel", "A Case of You - Joni Mitchell", "Diamonds & Rust - Joan Baez", "Pink Moon - Nick Drake", "Naked as We Came - Iron & Wine", "White Winter Hymnal - Fleet Foxes", "Chicago - Sufjan Stevens", "Love Is All - The Tallest Man on Earth", "I See a Darkness - Bonnie 'Prince' Billy"],
        genres: ["folk", "singer-songwriter", "indie folk", "folk rock", "americana", "alt folk", "chamber folk", "country folk", "acoustic", "classic folk"]
    },
    {
        username: "shoegazr",
        country: "🇺🇸",
        artists: ["My Bloody Valentine", "Slowdive", "Ride", "Lush", "Cocteau Twins", "Alvvays", "Nothing", "DIIV", "Whirr", "Cigarettes After Sex"],
        songs: ["Only Shallow - MBV", "Alison - Slowdive", "Vapour Trail - Ride", "Sweetness and Light - Lush", "Heaven or Las Vegas - Cocteau Twins", "Archie, Marry Me - Alvvays", "Vertigo Flowers - Nothing", "Doused - DIIV", "Ease - Whirr", "Apocalypse - Cigarettes After Sex"],
        genres: ["shoegaze", "dream pop", "noise pop", "ethereal wave", "indie rock", "post-punk", "alt rock", "ambient pop", "lo-fi", "gaze pop"]
    },
    {
        username: "funkyfresh",
        country: "🇺🇸",
        artists: ["Prince", "James Brown", "Parliament", "Earth, Wind & Fire", "Chic", "Rick James", "Sly & The Family Stone", "Tower of Power", "Vulfpeck", "Jamiroquai"],
        songs: ["Kiss - Prince", "Get Up Offa That Thing - James Brown", "Give Up the Funk - Parliament", "September - EWF", "Le Freak - Chic", "Super Freak - Rick James", "Thank You - Sly & The Family Stone", "What Is Hip? - Tower of Power", "Dean Town - Vulfpeck", "Virtual Insanity - Jamiroquai"],
        genres: ["funk", "soul", "disco", "r&b", "groove", "neo soul", "jazz funk", "dance", "pop funk", "retro soul"]
    },
    {
        username: "classicalcat",
        country: "🇺🇸",
        artists: ["Ludwig van Beethoven", "Wolfgang Amadeus Mozart", "Johann Sebastian Bach", "Frédéric Chopin", "Claude Debussy", "Pyotr Ilyich Tchaikovsky", "Antonio Vivaldi", "Sergei Rachmaninoff", "Igor Stravinsky", "Philip Glass"],
        songs: ["Moonlight Sonata - Beethoven", "Eine kleine Nachtmusik - Mozart", "Toccata and Fugue - Bach", "Nocturne Op.9 No.2 - Chopin", "Clair de Lune - Debussy", "Swan Lake - Tchaikovsky", "Four Seasons: Spring - Vivaldi", "Piano Concerto No.2 - Rachmaninoff", "The Rite of Spring - Stravinsky", "Glassworks - Philip Glass"],
        genres: ["classical", "romantic", "baroque", "impressionist", "modern classical", "piano", "orchestral", "chamber music", "minimalism", "symphonic"]
    },
    {
        username: "latinvibes",
        country: "🇺🇸",
        artists: ["Bad Bunny", "J Balvin", "Rosalía", "Ozuna", "Maluma", "Karol G", "Daddy Yankee", "Becky G", "Natti Natasha", "Luis Fonsi"],
        songs: ["Tití Me Preguntó - Bad Bunny", "Mi Gente - J Balvin", "Con Altura - Rosalía", "Se Preparó - Ozuna", "Felices los 4 - Maluma", "Tusa - Karol G", "Gasolina - Daddy Yankee", "Mayores - Becky G", "Criminal - Natti Natasha", "Despacito - Luis Fonsi"],
        genres: ["reggaeton", "latin pop", "trap latino", "urbano", "latin urban", "pop", "dembow", "bachata", "latin trap", "dance"]
    },
    {
        username: "emocean",
        country: "🇺🇸",
        artists: ["Paramore", "My Chemical Romance", "Pierce The Veil", "Sleeping With Sirens", "Bring Me The Horizon", "All Time Low", "Mayday Parade", "The Used", "Taking Back Sunday", "La Dispute"],
        songs: ["Misery Business - Paramore", "Welcome to the Black Parade - MCR", "King for a Day - Pierce The Veil", "If You Can't Hang - SWS", "Can You Feel My Heart - BMTH", "Dear Maria, Count Me In - ATL", "Jamie All Over - Mayday Parade", "The Taste of Ink - The Used", "Cute Without the 'E' - TBS", "Such Small Hands - La Dispute"],
        genres: ["emo", "post-hardcore", "pop punk", "alt rock", "screamo", "punk", "emo pop", "alternative", "scene", "midwest emo"]
    },
    {
        username: "raporacle",
        country: "🇺🇸",
        artists: ["Kendrick Lamar", "J. Cole", "Drake", "Travis Scott", "Lil Wayne", "Nicki Minaj", "Megan Thee Stallion", "21 Savage", "Lil Baby", "Cordae"],
        songs: ["HUMBLE. - Kendrick Lamar", "No Role Modelz - J. Cole", "God's Plan - Drake", "SICKO MODE - Travis Scott", "A Milli - Lil Wayne", "Super Bass - Nicki Minaj", "Savage - Megan Thee Stallion", "a lot - 21 Savage", "Drip Too Hard - Lil Baby", "RNP - Cordae"],
        genres: ["hip hop", "rap", "trap", "mainstream rap", "southern rap", "pop rap", "conscious rap", "new school", "atlanta rap", "lyrical rap"]
    },
    {
        username: "indiebytes",
        country: "🇺🇸",
        artists: ["Phoebe Bridgers", "Soccer Mommy", "Snail Mail", "Lucy Dacus", "Julien Baker", "Japanese Breakfast", "Clairo", "Mitski", "Sharon Van Etten", "Angel Olsen"],
        songs: ["Motion Sickness - Phoebe Bridgers", "Circle the Drain - Soccer Mommy", "Pristine - Snail Mail", "Night Shift - Lucy Dacus", "Appointments - Julien Baker", "Be Sweet - Japanese Breakfast", "Bags - Clairo", "Nobody - Mitski", "Seventeen - Sharon Van Etten", "Shut Up Kiss Me - Angel Olsen"],
        genres: ["indie rock", "indie pop", "bedroom pop", "alt rock", "singer-songwriter", "dream pop", "lo-fi", "folk rock", "chamber pop", "alt indie"]
    },
    {
        username: "maplebeats",
        country: "🇨🇦",
        artists: ["Drake", "The Weeknd", "Justin Bieber", "Shawn Mendes", "Carly Rae Jepsen", "Alessia Cara", "Tory Lanez", "NAV", "Jessie Reyez", "Michael Bublé"],
        songs: ["Passionfruit - Drake", "Save Your Tears - The Weeknd", "Peaches - Justin Bieber", "There's Nothing Holdin' Me Back - Shawn Mendes", "Run Away With Me - Carly Rae Jepsen", "Scars To Your Beautiful - Alessia Cara", "Say It - Tory Lanez", "Myself - NAV", "Figures - Jessie Reyez", "Feeling Good - Michael Bublé"],
        genres: ["pop", "r&b", "hip hop", "canadian pop", "soul", "dance pop", "pop rap", "contemporary r&b", "neo soul", "adult contemporary"]
    },
    {
        username: "torontovibes",
        country: "🇨🇦",
        artists: ["PARTYNEXTDOOR", "Majid Jordan", "Roy Woods", "Drake", "The Weeknd", "NAV", "Jessie Reyez", "Allan Rayman", "Charlotte Cardin", "Tory Lanez"],
        songs: ["Break from Toronto - PND", "Her - Majid Jordan", "Drama - Roy Woods", "Marvins Room - Drake", "Wicked Games - The Weeknd", "Myself - NAV", "Figures - Jessie Reyez", "Tennessee - Allan Rayman", "Meaningless - Charlotte Cardin", "Say It - Tory Lanez"],
        genres: ["ovo sound", "alt r&b", "canadian r&b", "hip hop", "pop", "indie pop", "electronic", "r&b", "soul", "urban"]
    },
    {
        username: "indieeh",
        country: "🇨🇦",
        artists: ["Arcade Fire", "Feist", "Broken Social Scene", "Metric", "Stars", "Alvvays", "Mac DeMarco", "Grimes", "Carly Rae Jepsen", "The New Pornographers"],
        songs: ["Wake Up - Arcade Fire", "1234 - Feist", "Anthems for a Seventeen-Year-Old Girl - BSS", "Help I'm Alive - Metric", "Your Ex-Lover Is Dead - Stars", "Archie, Marry Me - Alvvays", "Chamber of Reflection - Mac DeMarco", "Oblivion - Grimes", "Run Away With Me - Carly Rae Jepsen", "Use It - The New Pornographers"],
        genres: ["indie rock", "canadian indie", "indie pop", "alt rock", "dream pop", "chamber pop", "singer-songwriter", "electropop", "art pop", "folk"]
    },
    {
        username: "montrealbeats",
        country: "🇨🇦",
        artists: ["Kaytranada", "Cœur de Pirate", "Men I Trust", "Godspeed You! Black Emperor", "TOPS", "Arcade Fire", "Grimes", "Charlotte Cardin", "Patrick Watson", "Plants and Animals"],
        songs: ["Lite Spots - Kaytranada", "Comme des enfants - Cœur de Pirate", "Show Me How - Men I Trust", "Storm - GY!BE", "Way to be Loved - TOPS", "Reflektor - Arcade Fire", "Genesis - Grimes", "Meaningless - Charlotte Cardin", "Je te laisserai des mots - Patrick Watson", "The Mama Papa - Plants and Animals"],
        genres: ["electronic", "indie pop", "canadian indie", "post-rock", "dream pop", "alt pop", "french pop", "singer-songwriter", "art pop", "chillwave"]
    },
    {
        username: "edmcanuck",
        country: "🇨🇦",
        artists: ["Rezz", "deadmau5", "Kaytranada", "Ekali", "Zeds Dead", "Tiga", "Ryan Hemsworth", "Adventure Club", "DVBBS", "Black Tiger Sex Machine"],
        songs: ["Edge - Rezz", "Strobe - deadmau5", "Glowed Up - Kaytranada", "Babylon - Ekali", "Eyes On Fire - Zeds Dead Remix", "Bugatti - Tiga", "Snow In Newark - Ryan Hemsworth", "Wonder - Adventure Club", "Tsunami - DVBBS", "Zombie - BTSM"],
        genres: ["edm", "canadian edm", "electronic", "bass", "trap", "future bass", "house", "dubstep", "dance", "electro"]
    },
    {
        username: "folklohr",
        country: "🇨🇦",
        artists: ["Gordon Lightfoot", "Joni Mitchell", "Leonard Cohen", "The Wailin' Jennys", "Great Lake Swimmers", "Sarah Harmer", "Bruce Cockburn", "Rufus Wainwright", "Kathleen Edwards", "Basia Bulat"],
        songs: ["If You Could Read My Mind - Gordon Lightfoot", "A Case of You - Joni Mitchell", "Suzanne - Leonard Cohen", "One Voice - The Wailin' Jennys", "Your Rocky Spine - Great Lake Swimmers", "Basement Apartment - Sarah Harmer", "Wondering Where the Lions Are - Bruce Cockburn", "Cigarettes and Chocolate Milk - Rufus Wainwright", "Six O'Clock News - Kathleen Edwards", "In the Night - Basia Bulat"],
        genres: ["folk", "canadian folk", "singer-songwriter", "indie folk", "folk rock", "chamber folk", "alt country", "roots", "acoustic", "classic folk"]
    },
    {
        username: "trapnorth",
        country: "🇨🇦",
        artists: ["NAV", "Tory Lanez", "Drake", "Pressa", "Killy", "88Glam", "Jazz Cartier", "Roy Woods", "Night Lovell", "Houdini"],
        songs: ["Myself - NAV", "Say It - Tory Lanez", "Nonstop - Drake", "Attachments - Pressa", "No Sad No Bad - Killy", "Bali - 88Glam", "Tempted - Jazz Cartier", "Drama - Roy Woods", "Still Cold - Night Lovell", "Late Nights - Houdini"],
        genres: ["trap", "canadian rap", "hip hop", "rap", "ovo sound", "alt r&b", "urban", "pop rap", "cloud rap", "toronto rap"]
    },
    {
        username: "aurorasky",
        country: "🇨🇦",
        artists: ["Lights", "Carly Rae Jepsen", "Alvvays", "Grimes", "Men I Trust", "Shawn Mendes", "Arcade Fire", "Feist", "The Weeknd", "Drake"],
        songs: ["Up We Go - Lights", "Call Me Maybe - Carly Rae Jepsen", "Archie, Marry Me - Alvvays", "Oblivion - Grimes", "Show Me How - Men I Trust", "Stitches - Shawn Mendes", "Wake Up - Arcade Fire", "1234 - Feist", "Blinding Lights - The Weeknd", "Passionfruit - Drake"],
        genres: ["pop", "indie pop", "canadian pop", "synthpop", "alt pop", "electropop", "indie rock", "dream pop", "mainstream pop", "urban"]
    },
    {
        username: "desertwave",
        country: "🇦🇪",
        artists: ["Amr Diab", "Nancy Ajram", "Cairokee", "Hamza Namira", "Balqees", "Ahlam", "Hussain Al Jassmi", "Rashed Al-Majed", "Saad Lamjarred", "Sherine"],
        songs: ["Tamally Ma'ak - Amr Diab", "Ah W Noss - Nancy Ajram", "Ethbat Makanak - Cairokee", "Dari Ya Alby - Hamza Namira", "Majnoun - Balqees", "Hatha Ana - Ahlam", "Boshret Kheir - Hussain Al Jassmi", "El Hob El Kebeer - Rashed Al-Majed", "Lm3allem - Saad Lamjarred", "Hobbo Ganna - Sherine"],
        genres: ["arab pop", "khaleeji", "egyptian pop", "levant pop", "world music", "arabic ballad", "folk pop", "oriental pop", "arabic fusion", "pop"]
    },
    {
        username: "bollybeats",
        country: "🇦🇪",
        artists: ["Arijit Singh", "Shreya Ghoshal", "Neha Kakkar", "Badshah", "Atif Aslam", "Sunidhi Chauhan", "Pritam", "A. R. Rahman", "Jubin Nautiyal", "Vishal-Shekhar"],
        songs: ["Tum Hi Ho - Arijit Singh", "Teri Meri - Shreya Ghoshal", "Dilbar - Neha Kakkar", "DJ Waley Babu - Badshah", "Jeene Laga Hoon - Atif Aslam", "Sheila Ki Jawani - Sunidhi Chauhan", "Subhanallah - Pritam", "Jai Ho - A. R. Rahman", "Lut Gaye - Jubin Nautiyal", "Balam Pichkari - Vishal-Shekhar"],
        genres: ["bollywood", "indian pop", "filmi", "playback", "dance", "romantic", "desi pop", "hindi pop", "soundtrack", "world"]
    },
    {
        username: "dubaiwaves",
        country: "🇦🇪",
        artists: ["The Weeknd", "Drake", "Post Malone", "Dua Lipa", "Ed Sheeran", "Billie Eilish", "Ariana Grande", "Travis Scott", "Doja Cat", "Justin Bieber"],
        songs: ["Blinding Lights - The Weeknd", "God's Plan - Drake", "Circles - Post Malone", "Levitating - Dua Lipa", "Shape of You - Ed Sheeran", "bad guy - Billie Eilish", "7 rings - Ariana Grande", "SICKO MODE - Travis Scott", "Say So - Doja Cat", "Peaches - Justin Bieber"],
        genres: ["pop", "r&b", "hip hop", "mainstream pop", "dance", "trap", "urban", "alt pop", "contemporary pop", "pop rap"]
    },
    {
        username: "arabicfusion",
        country: "🇦🇪",
        artists: ["Elissa", "Tamer Hosny", "Haifa Wehbe", "Ragheb Alama", "Samira Said", "Wael Kfoury", "Carole Samaha", "Mohamed Hamaki", "Assala Nasri", "Sherine"],
        songs: ["Hob Kol Hayaty - Elissa", "180 Darga - Tamer Hosny", "Boos El Wawa - Haifa Wehbe", "Naseeni El Donya - Ragheb Alama", "Mazal - Samira Said", "Law Hobna Ghalta - Wael Kfoury", "Ghaly Alayi - Carole Samaha", "Ahla Haga Fiki - Mohamed Hamaki", "Aktar Wahed Beyhebak - Assala Nasri", "Mashaer - Sherine"],
        genres: ["arab pop", "egyptian pop", "lebanese pop", "oriental pop", "world", "arabic ballad", "khaleeji", "folk pop", "arabic fusion", "dance"]
    },
    {
        username: "expatmix",
        country: "🇦🇪",
        artists: ["Coldplay", "Imagine Dragons", "OneRepublic", "Maroon 5", "Adele", "Ed Sheeran", "Shawn Mendes", "Taylor Swift", "Billie Eilish", "Sam Smith"],
        songs: ["Viva La Vida - Coldplay", "Believer - Imagine Dragons", "Counting Stars - OneRepublic", "Sugar - Maroon 5", "Someone Like You - Adele", "Shape of You - Ed Sheeran", "Stitches - Shawn Mendes", "Blank Space - Taylor Swift", "bad guy - Billie Eilish", "Stay With Me - Sam Smith"],
        genres: ["pop", "rock", "alt pop", "indie pop", "mainstream pop", "britpop", "dance pop", "urban", "contemporary pop", "soft rock"]
    },
    {
        username: "nightdriveae",
        country: "🇦🇪",
        artists: ["The Chainsmokers", "Calvin Harris", "Zedd", "Martin Garrix", "Kygo", "David Guetta", "Alan Walker", "Avicii", "Marshmello", "DJ Snake"],
        songs: ["Closer - The Chainsmokers", "Summer - Calvin Harris", "Stay - Zedd & Alessia Cara", "Animals - Martin Garrix", "Firestone - Kygo", "Titanium - David Guetta", "Faded - Alan Walker", "Wake Me Up - Avicii", "Happier - Marshmello", "Let Me Love You - DJ Snake"],
        genres: ["edm", "dance", "pop", "electronic", "future house", "progressive house", "tropical house", "mainstream edm", "club", "electropop"]
    },
    {
        username: "indieoasis",
        country: "🇦🇪",
        artists: ["Arctic Monkeys", "Tame Impala", "The 1975", "Lana Del Rey", "Billie Eilish", "The Neighbourhood", "Hozier", "The Strokes", "Phoebe Bridgers", "Mitski"],
        songs: ["Do I Wanna Know? - Arctic Monkeys", "The Less I Know The Better - Tame Impala", "Love It If We Made It - The 1975", "West Coast - Lana Del Rey", "bad guy - Billie Eilish", "Sweater Weather - The Neighbourhood", "Take Me to Church - Hozier", "Last Nite - The Strokes", "Motion Sickness - Phoebe Bridgers", "Nobody - Mitski"],
        genres: ["indie pop", "alt rock", "indie rock", "dream pop", "bedroom pop", "pop", "singer-songwriter", "chillwave", "modern rock", "urban"]
    },
    {
        username: "bollyvibes",
        country: "🇦🇪",
        artists: ["Neha Kakkar", "Arijit Singh", "Badshah", "Shreya Ghoshal", "A. R. Rahman", "Jubin Nautiyal", "Pritam", "Sunidhi Chauhan", "Vishal-Shekhar", "Atif Aslam"],
        songs: ["Dilbar - Neha Kakkar", "Tum Hi Ho - Arijit Singh", "DJ Waley Babu - Badshah", "Teri Meri - Shreya Ghoshal", "Jai Ho - A. R. Rahman", "Lut Gaye - Jubin Nautiyal", "Subhanallah - Pritam", "Sheila Ki Jawani - Sunidhi Chauhan", "Balam Pichkari - Vishal-Shekhar", "Jeene Laga Hoon - Atif Aslam"],
        genres: ["bollywood", "indian pop", "filmi", "playback", "dance", "romantic", "desi pop", "hindi pop", "soundtrack", "world"]
    },
    {
        username: "arabtrap",
        country: "🇦🇪",
        artists: ["Wegz", "Marwan Moussa", "Sharmoofers", "Abyusif", "Ahmed Saad", "Balti", "Issam", "ElGrandeToto", "Soolking", "Lartiste"],
        songs: ["Dorak Gai - Wegz", "Sheraton - Marwan Moussa", "Moftaqed El Habiba - Sharmoofers", "Mamlaka - Abyusif", "El Melouk - Ahmed Saad", "Ya Lili - Balti", "Trap Beldi - Issam", "Hors Série - ElGrandeToto", "Dalida - Soolking", "Chocolat - Lartiste"],
        genres: ["arab trap", "egyptian rap", "maghreb rap", "trap", "hip hop", "arabic fusion", "urban", "pop", "world", "dance"]
    },
    {
        username: "expatbeats",
        country: "🇦🇪",
        artists: ["Ed Sheeran", "Coldplay", "Adele", "Billie Eilish", "The Weeknd", "Dua Lipa", "Imagine Dragons", "Shawn Mendes", "Taylor Swift", "Sam Smith"],
        songs: ["Shape of You - Ed Sheeran", "Viva La Vida - Coldplay", "Someone Like You - Adele", "bad guy - Billie Eilish", "Blinding Lights - The Weeknd", "Levitating - Dua Lipa", "Believer - Imagine Dragons", "Stitches - Shawn Mendes", "Blank Space - Taylor Swift", "Stay With Me - Sam Smith"],
        genres: ["pop", "mainstream pop", "indie pop", "britpop", "urban", "dance", "alt pop", "contemporary pop", "soft rock", "pop rock"]
    },
    {
        username: "nightowluae",
        country: "🇦🇪",
        artists: ["Khalid", "SZA", "H.E.R.", "Daniel Caesar", "Frank Ocean", "Brent Faiyaz", "Giveon", "Jorja Smith", "6LACK", "Summer Walker"],
        songs: ["Location - Khalid", "The Weekend - SZA", "Best Part - Daniel Caesar", "Thinkin Bout You - Frank Ocean", "Dead Man Walking - Brent Faiyaz", "Heartbreak Anniversary - Giveon", "Blue Lights - Jorja Smith", "PRBLMS - 6LACK", "Girls Need Love - Summer Walker", "Focus - H.E.R."],
        genres: ["r&b", "neo soul", "alt r&b", "urban", "contemporary r&b", "soul", "indie r&b", "pop", "bedroom pop", "modern r&b"]
    }
];

// Similarity calculation algorithm using Jaccard similarity
export function calculateSimilarity(user1Data: Partial<User>, user2: User): SimilarityResult {
    const getJaccardSimilarity = (set1: string[], set2: string[]) => {
        const intersection = set1.filter(item => set2.includes(item));
        const union = [...new Set([...set1, ...set2])];
        return union.length === 0 ? 0 : intersection.length / union.length;
    };

    const artistSimilarity = getJaccardSimilarity(user1Data.artists || [], user2.artists);
    const songSimilarity = getJaccardSimilarity(user1Data.songs || [], user2.songs);
    const genreSimilarity = getJaccardSimilarity(user1Data.genres || [], user2.genres);

    // Weighted average (genres matter most for taste similarity)
    const compatibility = Math.round((genreSimilarity * 0.5 + artistSimilarity * 0.3 + songSimilarity * 0.2) * 100);

    const commonArtists = (user1Data.artists || []).filter(artist => user2.artists.includes(artist));
    const commonSongs = (user1Data.songs || []).filter(song => user2.songs.includes(song));
    const commonGenres = (user1Data.genres || []).filter(genre => user2.genres.includes(genre));

    // Generate description based on compatibility and common items
    let description = "";
    if (compatibility >= 70) {
        if (commonGenres.length > 0) {
            description = `you both think ${commonGenres.slice(0, 2).join(" and ")} makes you cool`;
        } else if (commonArtists.length > 0) {
            description = `you both obsess over ${commonArtists.slice(0, 2).join(" and ")}`;
        } else {
            description = "somehow you found your musical soulmate";
        }
    } else if (compatibility >= 40) {
        if (commonGenres.length > 0) {
            description = `you both tolerate ${commonGenres.slice(0, 2).join(" and ")}`;
        } else if (commonArtists.length > 0) {
            description = `you both settled for ${commonArtists.slice(0, 2).join(" and ")}`;
        } else {
            description = "mediocre compatibility, fitting";
        }
    } else {
        if (commonGenres.length > 0) {
            description = `you both have terrible taste in ${commonGenres.slice(0, 2).join(" and ")}`;
        } else if (commonArtists.length > 0) {
            description = `you both unfortunately listen to ${commonArtists.slice(0, 2).join(" and ")}`;
        } else {
            description = "your tastes are incompatible, which is probably for the best";
        }
    }

    return {
        user: user2,
        compatibility,
        commonArtists,
        commonSongs,
        commonGenres,
        description
    };
}

export function findSimilarUsers(userData: Partial<User>, allUsers: User[], limit: number = 5): SimilarityResult[] {
    // Combine real users and mock users
    const combinedUsers = [...allUsers, ...MOCK_USERS];

    return combinedUsers
        .map(user => calculateSimilarity(userData, user))
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, limit);
}

export function getUserByUsername(username: string): User | null {
    return MOCK_USERS.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
}