import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Link } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar as CalendarIcon, Moon, Rocket, Star, Globe } from 'lucide-react';
import { HebrewDate } from 'hebrew-date';
import { format as formatJalali } from 'date-fns-jalali';
import { JulianDate } from 'julian-date';
import { ChineseDate } from 'chinese-lunar-calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Months of the year (May to December only)
const MONTHS = [
  'May', 'June', 'July', 'August', 
  'September', 'October', 'November', 'December'
];

// Days of the week
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Calendar types
type CalendarType = 
  | 'us-holiday' 
  | 'world-cup' 
  | 'space-mission' 
  | 'orthodox' 
  | 'jewish-holiday' 
  | 'iran-holiday' 
  | 'astrology' 
  | 'astronomy'
  | 'election';

// Calendar configuration
const CALENDAR_TYPES: {
  id: CalendarType;
  name: string;
  description: string;
  color: string;
  emoji: string;
}[] = [
  { 
    id: 'us-holiday', 
    name: 'US Holidays & Market Schedule', 
    description: 'Federal holidays and market closures/early closings',
    color: 'bg-[#FFCCCC] text-black border-black',  // Crimson
    emoji: '🇺🇸'
  },
  { 
    id: 'world-cup', 
    name: 'World Cup Qualifier Games', 
    description: 'Important soccer/football matches',
    color: 'bg-[#CCFFCC] text-black border-black',  // Forest Green
    emoji: '⚽'
  },
  { 
    id: 'space-mission', 
    name: 'Space Missions', 
    description: 'Launches, landings, and key space events',
    color: 'bg-[#CCCCFF] text-black border-black',  // Navy Blue
    emoji: '🚀'
  },
  { 
    id: 'orthodox', 
    name: 'Orthodox Feasts and Fasts', 
    description: 'Important dates in the Orthodox calendar',
    color: 'bg-[#FFFACC] text-black border-black',  // Goldenrod
    emoji: '☦️'
  },
  { 
    id: 'jewish-holiday', 
    name: 'Jewish Holidays', 
    description: 'Major Jewish holidays and observances',
    color: 'bg-[#FFE0CC] text-black border-black',  // Burnt Orange (using Chocolate)
    emoji: '✡️'
  },
  { 
    id: 'iran-holiday', 
    name: 'Iran Holidays', 
    description: 'Iranian national and religious holidays',
    color: 'bg-[#CCFFFF] text-black border-black',  // Teal
    emoji: '🇮🇷'
  },
  { 
    id: 'astrology', 
    name: 'Astrology', 
    description: 'Sign changes, retrogrades, and astrological events',
    color: 'bg-[#FFCCFF] text-black border-black',  // Magenta
    emoji: '♈'
  },
  { 
    id: 'astronomy', 
    name: 'Astronomy Events', 
    description: 'Meteor showers, planetary events, eclipses, and celestial conjunctions',
    color: 'bg-[#DDCCFF] text-black border-black',  // Deep Purple (using DarkSlateBlue)
    emoji: '🔭'
  },
  { 
    id: 'election', 
    name: 'Global Elections', 
    description: 'Presidential, parliamentary, and referendum elections worldwide',
    color: 'bg-[#DDFFDD] text-black border-black',  // Charcoal (using DarkSlateGray)
    emoji: '🗳️'
  }
];

// Special dates for 2025
const SPECIAL_DATES = [
  // Market Holidays and US Holidays
  { name: 'Memorial Day', date: '2025-05-26', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  { name: 'Juneteenth', date: '2025-06-19', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  { name: 'Independence Day', date: '2025-07-04', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  { name: 'Labor Day', date: '2025-09-01', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  { name: 'Thanksgiving Day', date: '2025-11-27', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  { name: 'Christmas Day', date: '2025-12-25', type: 'us-holiday', description: 'Markets Closed | Federal Holiday', categories: ['us-holiday'] },
  
  // Market Early Closures
  { name: 'Day before Independence Day', date: '2025-07-03', type: 'us-holiday', description: 'Markets Close 1:00 p.m.', categories: ['us-holiday'] },
  { name: 'Day after Thanksgiving', date: '2025-11-28', type: 'us-holiday', description: 'Markets Close 1:00 p.m.', categories: ['us-holiday'] },
  { name: 'Christmas Eve', date: '2025-12-24', type: 'us-holiday', description: 'Markets Close 1:00 p.m.', categories: ['us-holiday'] },
  
  // US Holidays (not already covered by market holidays)
  { name: 'Veterans Day', date: '2025-11-11', type: 'us-holiday', description: 'Federal Holiday', categories: ['us-holiday'] },
  { name: 'Columbus Day', date: '2025-10-13', type: 'us-holiday', description: 'Federal Holiday', categories: ['us-holiday'] },
  
  // CONCACAF World Cup Qualifiers - June 4, 2025
  { name: 'Bermuda vs Cayman Islands', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Bermuda National Stadium, Devonshire Parish', categories: ['world-cup'] },
  { name: 'Grenada vs Bahamas', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Kirani James Athletic Stadium, St. George\'s', categories: ['world-cup'] },
  { name: 'Barbados vs Aruba', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - BFA Technical Centre, Wildey', categories: ['world-cup'] },
  { name: 'Montserrat vs Belize', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Ato Boldon Stadium, Couva', categories: ['world-cup'] },
  { name: 'Dominica vs British Virgin Islands', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Windsor Park, Roseau', categories: ['world-cup'] },
  { name: 'Saint Vincent and the Grenadines vs Anguilla', date: '2025-06-04', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Arnos Vale Stadium, Kingstown', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - June 6, 2025
  { name: 'Estonia vs Israel', date: '2025-06-06', type: 'world-cup', description: 'UEFA World Cup Qualifier - Lilleküla Stadium, Tallinn', categories: ['world-cup'] },
  { name: 'Norway vs Italy', date: '2025-06-06', type: 'world-cup', description: 'UEFA World Cup Qualifier - Ullevaal Stadion, Oslo', categories: ['world-cup'] },
  { name: 'North Macedonia vs Belgium', date: '2025-06-06', type: 'world-cup', description: 'UEFA World Cup Qualifier - Toše Proeski Arena, Skopje', categories: ['world-cup'] },
  { name: 'Wales vs Liechtenstein', date: '2025-06-06', type: 'world-cup', description: 'UEFA World Cup Qualifier - Cardiff City Stadium, Cardiff', categories: ['world-cup'] },
  { name: 'Andorra vs England', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - RCDE Stadium, Barcelona (Spain)', categories: ['world-cup'] },
  { name: 'Albania vs Serbia', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Arena Kombëtare, Tirana', categories: ['world-cup'] },
  { name: 'Bosnia and Herzegovina vs San Marino', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Stadion Bilino Polje, Zenica', categories: ['world-cup'] },
  { name: 'Austria vs Romania', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Ernst-Happel-Stadion, Vienna', categories: ['world-cup'] },
  { name: 'Malta vs Lithuania', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - National Stadium, Ta\' Qali', categories: ['world-cup'] },
  { name: 'Finland vs Netherlands', date: '2025-06-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Helsinki Olympic Stadium, Helsinki', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - June 9, 2025
  { name: 'Estonia vs Norway', date: '2025-06-09', type: 'world-cup', description: 'UEFA World Cup Qualifier - Lilleküla Stadium, Tallinn', categories: ['world-cup'] },
  { name: 'Italy vs Moldova', date: '2025-06-09', type: 'world-cup', description: 'UEFA World Cup Qualifier - Mapei Stadium, Reggio Emilia', categories: ['world-cup'] },
  { name: 'Kazakhstan vs North Macedonia', date: '2025-06-09', type: 'world-cup', description: 'UEFA World Cup Qualifier - Astana Arena, Astana', categories: ['world-cup'] },
  { name: 'Belgium vs Wales', date: '2025-06-09', type: 'world-cup', description: 'UEFA World Cup Qualifier - King Baudouin Stadium, Brussels', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - June 10, 2025
  { name: 'Finland vs Poland', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Helsinki Olympic Stadium, Helsinki', categories: ['world-cup'] },
  { name: 'Netherlands vs Malta', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Euroborg, Groningen', categories: ['world-cup'] },
  { name: 'Romania vs Cyprus', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - National Arena, Bucharest', categories: ['world-cup'] },
  { name: 'San Marino vs Austria', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - San Marino Stadium, Serravalle', categories: ['world-cup'] },
  { name: 'Latvia vs Albania', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Skonto Stadions, Riga', categories: ['world-cup'] },
  { name: 'Serbia vs Andorra', date: '2025-06-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Gradski stadion Dubočica, Leskovac', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - September 4, 2025
  { name: 'Luxembourg vs Northern Ireland', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier - Stade de Luxembourg, Luxembourg City', categories: ['world-cup'] },
  { name: 'Slovakia vs Germany', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier - Tehelné pole, Bratislava', categories: ['world-cup'] },
  { name: 'Lithuania vs Malta', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Netherlands vs Poland', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Georgia vs Turkey', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Bulgaria vs Spain', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Kazakhstan vs Wales', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Liechtenstein vs Belgium', date: '2025-09-04', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Latvia vs Serbia', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'England vs Andorra', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier - Villa Park, Birmingham', categories: ['world-cup'] },
  { name: 'Armenia vs Portugal', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Republic of Ireland vs Hungary', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Austria vs Cyprus', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'San Marino vs Bosnia and Herzegovina', date: '2025-09-06', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Slovenia vs Sweden', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Switzerland vs Kosovo', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Greece vs Belarus', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Denmark vs Scotland', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Iceland vs Azerbaijan', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Ukraine vs France', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Faroe Islands vs Croatia', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Montenegro vs Czech Republic', date: '2025-09-05', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - September 7-9, 2025
  { name: 'Luxembourg vs Slovakia', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Stade de Luxembourg, Luxembourg City', categories: ['world-cup'] },
  { name: 'Germany vs Northern Ireland', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - RheinEnergieStadion, Cologne', categories: ['world-cup'] },
  { name: 'Georgia vs Bulgaria', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Turkey vs Spain', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Lithuania vs Netherlands', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Poland vs Finland', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'North Macedonia vs Liechtenstein', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier - Toše Proeski Arena, Skopje', categories: ['world-cup'] },
  { name: 'Belgium vs Kazakhstan', date: '2025-09-07', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Gibraltar vs Faroe Islands', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Croatia vs Montenegro', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Albania vs Latvia', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Serbia vs England', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Armenia vs Republic of Ireland', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Hungary vs Portugal', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Bosnia and Herzegovina vs Austria', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Cyprus vs Romania', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Kosovo vs Sweden', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Switzerland vs Slovenia', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Belarus vs Scotland', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Greece vs Denmark', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Azerbaijan vs Ukraine', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'France vs Iceland', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Israel vs Italy', date: '2025-09-08', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Norway vs Moldova', date: '2025-09-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - October 2025
  { name: 'Northern Ireland vs Slovakia', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Windsor Park, Belfast', categories: ['world-cup'] },
  { name: 'Germany vs Luxembourg', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier - Rhein-Neckar-Arena, Sinsheim', categories: ['world-cup'] },
  { name: 'Kosovo vs Slovenia', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Sweden vs Switzerland', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Belarus vs Denmark', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Scotland vs Greece', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Iceland vs Ukraine', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'France vs Azerbaijan', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Norway vs Israel', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Estonia vs Italy', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Bulgaria vs Turkey', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Spain vs Georgia', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Kazakhstan vs Liechtenstein', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Belgium vs North Macedonia', date: '2025-10-10', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Portugal vs Republic of Ireland', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Hungary vs Armenia', date: '2025-10-11', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Austria vs San Marino', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Cyprus vs Bosnia and Herzegovina', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Finland vs Lithuania', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Malta vs Netherlands', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Czech Republic vs Croatia', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Faroe Islands vs Montenegro', date: '2025-10-09', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - October 12-14, 2025
  { name: 'Northern Ireland vs Germany', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier - Windsor Park, Belfast', categories: ['world-cup'] },
  { name: 'Slovakia vs Luxembourg', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier - Anton Malatinský Stadium, Trnava', categories: ['world-cup'] },
  { name: 'Scotland vs Belarus', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Denmark vs Greece', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Slovenia vs Switzerland', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Sweden vs Kosovo', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Iceland vs France', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Ukraine vs Azerbaijan', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Estonia vs Moldova', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Italy vs Israel', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Turkey vs Georgia', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Spain vs Bulgaria', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'North Macedonia vs Kazakhstan', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier - Toše Proeski Arena, Skopje', categories: ['world-cup'] },
  { name: 'Wales vs Belgium', date: '2025-10-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Republic of Ireland vs Armenia', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Portugal vs Hungary', date: '2025-10-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'San Marino vs Cyprus', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Romania vs Austria', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Lithuania vs Poland', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Netherlands vs Finland', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Croatia vs Gibraltar', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Faroe Islands vs Czech Republic', date: '2025-10-12', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - November 2025
  { name: 'Luxembourg vs Germany', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier - Stade de Luxembourg, Luxembourg City', categories: ['world-cup'] },
  { name: 'Slovakia vs Northern Ireland', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier - Košická futbalová aréna, Košice', categories: ['world-cup'] },
  { name: 'Slovenia vs Kosovo', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Switzerland vs Sweden', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Greece vs Scotland', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Denmark vs Belarus', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Azerbaijan vs Iceland', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'France vs Ukraine', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Estonia vs Norway', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Moldova vs Italy', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Georgia vs Spain', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Turkey vs Bulgaria', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Kazakhstan vs Belgium', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Liechtenstein vs Wales', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Armenia vs Hungary', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Republic of Ireland vs Portugal', date: '2025-11-13', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Cyprus vs Austria', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Bosnia and Herzegovina vs Romania', date: '2025-11-15', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Finland vs Malta', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Poland vs Netherlands', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Gibraltar vs Montenegro', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Croatia vs Faroe Islands', date: '2025-11-14', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // UEFA World Cup Qualifiers - November 16-18, 2025
  { name: 'Northern Ireland vs Luxembourg', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier - Windsor Park, Belfast', categories: ['world-cup'] },
  { name: 'Germany vs Slovakia', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier - Red Bull Arena, Leipzig', categories: ['world-cup'] },
  { name: 'Kosovo vs Switzerland', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Sweden vs Slovenia', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Belarus vs Greece', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Scotland vs Denmark', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Azerbaijan vs France', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Ukraine vs Iceland', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Bulgaria vs Georgia', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Spain vs Turkey', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Belgium vs Liechtenstein', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Wales vs North Macedonia', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Hungary vs Republic of Ireland', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Portugal vs Armenia', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Austria vs Bosnia and Herzegovina', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Romania vs San Marino', date: '2025-11-18', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Malta vs Poland', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Netherlands vs Lithuania', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Czech Republic vs Gibraltar', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Montenegro vs Croatia', date: '2025-11-17', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Israel vs Moldova', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  { name: 'Italy vs Norway', date: '2025-11-16', type: 'world-cup', description: 'UEFA World Cup Qualifier', categories: ['world-cup'] },
  
  // AFC World Cup Qualifiers - June 5, 2025
  { name: 'United Arab Emirates vs Uzbekistan', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Al Nahyan Stadium, Abu Dhabi', categories: ['world-cup'] },
  { name: 'Qatar vs Iran', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Al Thumama Stadium, Doha', categories: ['world-cup'] },
  { name: 'North Korea vs Kyrgyzstan', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Prince Faisal bin Fahd Sports City Stadium, Riyadh', categories: ['world-cup'] },
  { name: 'Oman vs Jordan', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Sultan Qaboos Sports Complex, Muscat', categories: ['world-cup'] },
  { name: 'Iraq vs South Korea', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Basra International Stadium, Basra', categories: ['world-cup'] },
  { name: 'Kuwait vs Palestine', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Jaber Al-Ahmad International Stadium, Kuwait City', categories: ['world-cup'] },
  { name: 'Australia vs Japan', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Perth Stadium, Perth', categories: ['world-cup'] },
  { name: 'Indonesia vs China', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Gelora Bung Karno Stadium, Jakarta', categories: ['world-cup'] },
  { name: 'Bahrain vs Saudi Arabia', date: '2025-06-05', type: 'world-cup', description: 'AFC World Cup Qualifier - Bahrain National Stadium, Riffa', categories: ['world-cup'] },
  
  // CONCACAF World Cup Qualifiers - June 6, 2025
  { name: 'Antigua and Barbuda vs Cuba', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - ABFA Technical Centre, Piggotts', categories: ['world-cup'] },
  { name: 'Trinidad and Tobago vs Saint Kitts and Nevis', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Hasely Crawford Stadium, Port of Spain', categories: ['world-cup'] },
  { name: 'Curaçao vs Saint Lucia', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Ergilio Hato Stadium, Willemstad', categories: ['world-cup'] },
  { name: 'Nicaragua vs Guyana', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Nacional, Managua', categories: ['world-cup'] },
  { name: 'Guatemala vs Dominican Republic', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Cementos Progreso, Guatemala City', categories: ['world-cup'] },
  { name: 'Suriname vs Puerto Rico', date: '2025-06-06', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Franklin Essed Stadion, Paramaribo', categories: ['world-cup'] },
  
  // CONCACAF World Cup Qualifiers - June 7, 2025
  { name: 'Cayman Islands vs Honduras', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Truman Bodden Sports Complex, George Town', categories: ['world-cup'] },
  { name: 'Bahamas vs Costa Rica', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - BFA Technical Centre, Wildey', categories: ['world-cup'] },
  { name: 'Aruba vs Haiti', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Trinidad Stadium, Oranjestad', categories: ['world-cup'] },
  { name: 'Belize vs Panama', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - FFB Field, Belmopan', categories: ['world-cup'] },
  { name: 'British Virgin Islands vs Jamaica', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - A. O. Shirley Recreation Ground, Road Town', categories: ['world-cup'] },
  { name: 'Anguilla vs El Salvador', date: '2025-06-07', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Raymond E. Guishard Technical Centre, The Valley', categories: ['world-cup'] },
  
  // AFC World Cup Qualifiers - June 10, 2025
  { name: 'Uzbekistan vs Qatar', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Milliy Stadium, Tashkent', categories: ['world-cup'] },
  { name: 'Kyrgyzstan vs United Arab Emirates', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Dolen Omurzakov Stadium, Bishkek', categories: ['world-cup'] },
  { name: 'Iran vs North Korea', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Imam Reza Stadium, Mashhad', categories: ['world-cup'] },
  { name: 'South Korea vs Kuwait', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Seoul World Cup Stadium, Seoul', categories: ['world-cup'] },
  { name: 'Jordan vs Iraq', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Amman International Stadium, Amman', categories: ['world-cup'] },
  { name: 'Palestine vs Oman', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - King Abdullah II Stadium, Amman', categories: ['world-cup'] },
  { name: 'Japan vs Indonesia', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Suita City Football Stadium, Suita', categories: ['world-cup'] },
  { name: 'China vs Bahrain', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - Longxing Football Stadium, Chongqing', categories: ['world-cup'] },
  { name: 'Saudi Arabia vs Australia', date: '2025-06-10', type: 'world-cup', description: 'AFC World Cup Qualifier - King Abdullah Sports City Stadium, Jeddah', categories: ['world-cup'] },
  
  // CONCACAF World Cup Qualifiers - June 10, 2025
  { name: 'Cuba vs Bermuda', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Antonio Maceo, Santiago de Cuba', categories: ['world-cup'] },
  { name: 'Honduras vs Antigua and Barbuda', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Nacional Chelato Uclés, Tegucigalpa', categories: ['world-cup'] },
  { name: 'Saint Kitts and Nevis vs Grenada', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - SKNFA Technical Center, Basseterre', categories: ['world-cup'] },
  { name: 'Costa Rica vs Trinidad and Tobago', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Nacional, San José', categories: ['world-cup'] },
  { name: 'Saint Lucia vs Barbados', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Daren Sammy Cricket Ground, Gros Islet', categories: ['world-cup'] },
  { name: 'Haiti vs Curaçao', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Trinidad Stadium, Oranjestad', categories: ['world-cup'] },
  { name: 'Guyana vs Montserrat', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Synthetic Track and Field Facility, Leonora', categories: ['world-cup'] },
  { name: 'Panama vs Nicaragua', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Rommel Fernandez, Panama City', categories: ['world-cup'] },
  { name: 'Dominican Republic vs Dominica', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Olímpico Félix Sánchez, Santo Domingo', categories: ['world-cup'] },
  { name: 'Jamaica vs Guatemala', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Independence Park, Kingston', categories: ['world-cup'] },
  { name: 'Puerto Rico vs Saint Vincent and the Grenadines', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Mayagüez Athletics Stadium, Mayagüez', categories: ['world-cup'] },
  { name: 'El Salvador vs Suriname', date: '2025-06-10', type: 'world-cup', description: 'CONCACAF World Cup Qualifier - Estadio Cuscatlan, San Salvador', categories: ['world-cup'] },
  
  // CONMEBOL World Cup Qualifiers - June 10, 2025
  { name: 'Bolivia vs Chile', date: '2025-06-10', type: 'world-cup', description: 'CONMEBOL World Cup Qualifier - Estadio Municipal de El Alto, El Alto', categories: ['world-cup'] },
  { name: 'Uruguay vs Venezuela', date: '2025-06-10', type: 'world-cup', description: 'CONMEBOL World Cup Qualifier - Estadio Centenario, Montevideo', categories: ['world-cup'] },
  { name: 'Argentina vs Colombia', date: '2025-06-10', type: 'world-cup', description: 'CONMEBOL World Cup Qualifier - Estadio Monumental, Buenos Aires', categories: ['world-cup'] },
  { name: 'Brazil vs Paraguay', date: '2025-06-10', type: 'world-cup', description: 'CONMEBOL World Cup Qualifier - Arena Corinthians, São Paulo', categories: ['world-cup'] },
  { name: 'Peru vs Ecuador', date: '2025-06-10', type: 'world-cup', description: 'CONMEBOL World Cup Qualifier - Estadio Nacional, Lima', categories: ['world-cup'] },
  
  // Space Missions
  { name: 'Starship Flight 9 (Integrated Flight Test 9)', date: '2025-05-19', type: 'space-mission', description: 'Suborbital test flight - Starbase, Orbital Launch Pad A, South Texas. Vehicle: Super Heavy Booster 14 (reused) and Starship upper stage (Ship 35). Third flight of the Block 2 Starship upper stage, with booster catch attempt using Mechazilla launch tower.', categories: ['space-mission'] },
  { name: 'Axiom Mission 4 (Ax-4)', date: '2025-05-29', type: 'space-mission', description: 'ISS Commercial Crew Mission - Kennedy Space Center, FL. Falcon 9, Crew Dragon C213. Crew: Peggy Whitson (USA), Shubhanshu Shukla (India), Sławosz Uznański-Wiśniewski (Poland), Tibor Kapu (Hungary). First ISS missions for India, Poland, Hungary in decades.', categories: ['space-mission'] },
  { name: 'Hakuto-R Mission 2', date: '2025-06-05', type: 'space-mission', description: 'Lunar Landing Mission - Japanese company ispace\'s second attempt at a soft landing on the lunar surface, targeting Mare Frigoris. Carries micro-rover and scientific payloads to study potential water ice deposits.', categories: ['space-mission'] },
  { name: 'Parker Solar Probe - 24th Perihelion', date: '2025-06-19', type: 'space-mission', description: 'NASA\'s probe reaches closest point to Sun in its 24th orbit, approaching within 6.1 million km of the Sun\'s surface at speeds up to 690,000 km/h. Collecting critical data on solar magnetic fields and solar wind.', categories: ['space-mission'] },
  { name: 'JUICE - Venus Gravity Assist', date: '2025-08-31', type: 'space-mission', description: 'European Space Agency\'s Jupiter Icy Moons Explorer performs gravity assist at Venus to adjust trajectory toward Jupiter. Critical maneuver in its journey to study Jupiter\'s icy moons for habitability.', categories: ['space-mission'] },
  { name: 'Parker Solar Probe - 25th Perihelion', date: '2025-09-15', type: 'space-mission', description: 'NASA\'s probe executes its 25th close approach to the Sun, continuing to study solar corona and solar wind. Heat shield endures temperatures up to 1,400°C while instruments measure solar phenomena.', categories: ['space-mission'] },
  { name: 'Parker Solar Probe - 26th Perihelion', date: '2025-12-12', type: 'space-mission', description: 'NASA\'s probe reaches 26th closest approach to the Sun, gathering data as the Sun approaches solar maximum. Vital for developing models to mitigate space weather impacts on Earth.', categories: ['space-mission'] },
  { name: 'Solar Orbiter - Fifth Venus Gravity Assist', date: '2025-12-24', type: 'space-mission', description: 'ESA\'s Solar Orbiter performs fifth gravity assist at Venus to increase orbital inclination to 24 degrees. Marks start of high-latitude mission phase to observe Sun\'s polar regions.', categories: ['space-mission'] },
  
  // Orthodox Feasts and Fasts
  { name: '5th Sunday of Pascha (Samaritan Woman)', date: '2025-05-18', type: 'orthodox', description: 'This Sunday recalls Jesus\' meeting with the Samaritan woman at the well, emphasizing repentance and His revelation as the Messiah.', categories: ['orthodox'] },
  { name: '6th Sunday of Pascha (Blind Man)', date: '2025-05-25', type: 'orthodox', description: 'This Sunday commemorates the healing of the man born blind, symbolizing spiritual enlightenment through Christ.', categories: ['orthodox'] },
  { name: 'Ascension of Our Lord', date: '2025-05-29', type: 'orthodox', description: 'Celebrated 40 days after Pascha, this feast marks Jesus\' ascension into heaven, completing His earthly mission.', categories: ['orthodox'] },
  { name: '7th Sunday of Pascha (Fathers of the First Ecumenical Council)', date: '2025-06-01', type: 'orthodox', description: 'This Sunday honors the Church Fathers who defended Christ\'s divinity at the Council of Nicaea (325 AD).', categories: ['orthodox'] },
  { name: 'Holy Pentecost', date: '2025-06-08', type: 'orthodox', description: 'Celebrated 50 days after Pascha, this feast marks the Holy Spirit\'s descent on the apostles, launching the Church.', categories: ['orthodox'] },
  { name: 'Day of the Holy Spirit', date: '2025-06-09', type: 'orthodox', description: 'This day focuses on the Holy Spirit\'s ongoing work in the Church, following Pentecost.', categories: ['orthodox'] },
  { name: '3rd Day of the Holy Trinity', date: '2025-06-10', type: 'orthodox', description: 'The final day of Pentecost celebrations, highlighting the unity of the Father, Son, and Holy Spirit.', categories: ['orthodox'] },
  { name: 'Apostles\' Fast begins', date: '2025-06-15', type: 'orthodox', description: 'A fasting period preparing for the feast of Saints Peter and Paul, encouraging spiritual discipline.', categories: ['orthodox'] },
  { name: '2nd Sunday after Pentecost (All Saints of North America)', date: '2025-06-22', type: 'orthodox', description: 'This Sunday celebrates saints who lived in North America, honoring their faith and legacy.', categories: ['orthodox'] },
  { name: 'Nativity of St. John the Baptist', date: '2025-06-24', type: 'orthodox', description: 'This feast marks the birth of John the Baptist, the forerunner who prepared the way for Christ.', categories: ['orthodox'] },
  { name: 'Synaxis of the 12 Apostles, Apostles Peter & Paul', date: '2025-06-29', type: 'orthodox', description: 'This day honors the twelve apostles, especially Peter and Paul, for their missionary work.', categories: ['orthodox'] },
  { name: 'Deposition of the Robe of the Theotokos at Blachernae', date: '2025-07-02', type: 'orthodox', description: 'This feast celebrates the placement of Mary\'s robe in Constantinople, symbolizing her protection.', categories: ['orthodox'] },
  { name: 'Nativity of St. John the Baptist (Julian calendar)', date: '2025-07-07', type: 'orthodox', description: 'A secondary celebration of John\'s birth for those following the Julian calendar.', categories: ['orthodox'] },
  { name: 'Holy Great Martyr Marina', date: '2025-07-17', type: 'orthodox', description: 'This day honors St. Marina, a young martyr admired for her faith and miracles.', categories: ['orthodox'] },
  { name: 'Glorious Prophet Elias (Elijah)', date: '2025-07-20', type: 'orthodox', description: 'This feast celebrates Elijah, a prophet known for his miracles and messianic foreshadowing.', categories: ['orthodox'] },
  { name: 'Procession of the Honorable and Life-Giving Cross', date: '2025-08-01', type: 'orthodox', description: 'This feast venerates the Cross, recalling its significance in salvation.', categories: ['orthodox'] },
  { name: 'Transfiguration of Our Lord', date: '2025-08-06', type: 'orthodox', description: 'This major feast commemorates Jesus\' transfiguration, revealing His divine glory.', categories: ['orthodox'] },
  { name: 'Dormition of the Theotokos', date: '2025-08-15', type: 'orthodox', description: 'This feast marks the Virgin Mary\'s death and assumption into heaven, honoring her role as Christ\'s mother.', categories: ['orthodox'] },
  { name: 'Holy Apostle Bartholomew', date: '2025-08-19', type: 'orthodox', description: 'This day celebrates St. Bartholomew, an apostle known for his missionary zeal and martyrdom.', categories: ['orthodox'] },
  { name: 'Beheading of St. John the Baptist', date: '2025-08-29', type: 'orthodox', description: 'A solemn day recalling John the Baptist\'s martyrdom for his faithfulness.', categories: ['orthodox'] },
  { name: 'Beginning of the Ecclesiastical New Year (Indiction)', date: '2025-09-01', type: 'orthodox', description: 'This marks the start of the Church\'s liturgical year, a time for renewal.', categories: ['orthodox'] },
  { name: 'Nativity of the Theotokos', date: '2025-09-08', type: 'orthodox', description: 'This feast celebrates the Virgin Mary\'s birth, recognizing her role in salvation.', categories: ['orthodox'] },
  { name: 'Elevation of the Holy Cross', date: '2025-09-14', type: 'orthodox', description: 'This day honors the discovery and exaltation of the True Cross.', categories: ['orthodox'] },
  { name: 'St. John Chrysostom, Archbishop of Constantinople', date: '2025-09-26', type: 'orthodox', description: 'This feast celebrates St. John Chrysostom, known for his preaching and liturgy.', categories: ['orthodox'] },
  { name: 'Protection of the Theotokos', date: '2025-10-01', type: 'orthodox', description: 'This feast honors the Virgin Mary\'s intercession and care for the faithful.', categories: ['orthodox'] },
  { name: 'Holy Apostle Thomas', date: '2025-10-14', type: 'orthodox', description: 'This day celebrates St. Thomas, remembered for his journey from doubt to faith.', categories: ['orthodox'] },
  { name: 'Holy Great Martyr Demetrius', date: '2025-10-26', type: 'orthodox', description: 'This feast honors St. Demetrius, a martyr revered for his courage and miracles.', categories: ['orthodox'] },
  { name: 'Holy Archangel Michael and the Other Bodiless Powers', date: '2025-11-08', type: 'orthodox', description: 'This day celebrates the archangels and angels as God\'s messengers and protectors.', categories: ['orthodox'] },
  { name: 'Nativity Fast begins', date: '2025-11-15', type: 'orthodox', description: 'A 40-day fast preparing for Christ\'s birth, focusing on spiritual readiness.', categories: ['orthodox'] },
  { name: 'Entry of the Theotokos into the Temple', date: '2025-11-21', type: 'orthodox', description: 'This feast recalls Mary\'s dedication to God as a child in the Temple.', categories: ['orthodox'] },
  { name: 'Holy Great Martyr Catherine', date: '2025-11-25', type: 'orthodox', description: 'This day honors St. Catherine, a martyr celebrated for her wisdom and faith.', categories: ['orthodox'] },
  { name: 'Holy Great Martyr Barbara', date: '2025-12-04', type: 'orthodox', description: 'This feast celebrates St. Barbara, known for her faith and protection in danger.', categories: ['orthodox'] },
  { name: 'St. Nicholas, Archbishop of Myra', date: '2025-12-06', type: 'orthodox', description: 'This popular day honors St. Nicholas, famed for his kindness and miracles.', categories: ['orthodox'] },
  { name: 'Conception of St. Anna by Righteous Joachim', date: '2025-12-09', type: 'orthodox', description: 'This day marks the conception of Mary, celebrating God\'s plan for redemption.', categories: ['orthodox'] },
  { name: 'Nativity of Our Lord', date: '2025-12-25', type: 'orthodox', description: 'This major feast celebrates Jesus\' birth, the Incarnation of God as man.', categories: ['orthodox'] },
  
  // Jewish Holidays
  // May 2025 (Iyar – Sivan 5785)
  { name: 'Lag BaOmer', date: '2025-05-16', type: 'jewish-holiday', description: 'The 33rd day of the Omer count between Passover and Shavuot, commemorates the cessation of a plague that afflicted Rabbi Akiva\'s students and celebrates Rabbi Shimon bar Yochai. Customs: Bonfires, outings, festive gatherings, weddings.', categories: ['jewish-holiday'] },
  { name: 'Yom Yerushalayim', date: '2025-05-26', type: 'jewish-holiday', description: 'Jerusalem Day marks the reunification of Jerusalem during the Six-Day War in 1967. Celebrated with prayers, ceremonies, and public events emphasizing Jerusalem\'s significance in Jewish life.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur Katan', date: '2025-05-27', type: 'jewish-holiday', description: 'Minor Day of Atonement observed before Rosh Chodesh. Includes fasting, repentance, and special prayers (Selichot) for spiritual preparation.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Sivan', date: '2025-05-28', type: 'jewish-holiday', description: 'Beginning of the month of Sivan, observed with special prayers including Hallel and Torah readings. Significant as the month of Shavuot.', categories: ['jewish-holiday'] },
  
  // June 2025 (Sivan – Tamuz 5785)
  { name: 'Erev Shavuot', date: '2025-06-01', type: 'jewish-holiday', description: 'Eve of Shavuot, with preparations including Torah study and decorating homes and synagogues with greenery.', categories: ['jewish-holiday'] },
  { name: 'Shavuot', date: '2025-06-02', type: 'jewish-holiday', description: 'Feast of Weeks commemorates the giving of the Torah at Mount Sinai. Observed with all-night Torah study, dairy meals, and synagogue services.', categories: ['jewish-holiday'] },
  { name: 'Yizkor (Shavuot)', date: '2025-06-02', type: 'jewish-holiday', description: 'Memorial prayer for deceased relatives recited during Shavuot.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur Katan', date: '2025-06-25', type: 'jewish-holiday', description: 'Minor Day of Atonement before Rosh Chodesh Tamuz, with fasting and penitential prayers.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Tamuz (Day 1)', date: '2025-06-26', type: 'jewish-holiday', description: 'Beginning of the month of Tamuz, with special prayers and Torah readings.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Tamuz (Day 2)', date: '2025-06-27', type: 'jewish-holiday', description: 'Second day of Rosh Chodesh Tamuz, continuing the observances with additional prayers.', categories: ['jewish-holiday'] },
  
  // July 2025 (Tamuz – Av 5785)
  { name: 'Tzom Tammuz', date: '2025-07-13', type: 'jewish-holiday', description: 'Fast of the 17th of Tammuz commemorates the breach of Jerusalem\'s walls in 586 BCE. Marks the start of the "Three Weeks" mourning period.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur Katan', date: '2025-07-24', type: 'jewish-holiday', description: 'Minor Day of Atonement before Rosh Chodesh Av, with fasting and prayers of repentance.', categories: ['jewish-holiday'] },
  { name: 'Jabotinsky Day', date: '2025-07-25', type: 'jewish-holiday', description: 'Honors Ze\'ev Jabotinsky, Zionist leader and founder of the Revisionist Zionist movement, through ceremonies and educational events.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Av', date: '2025-07-26', type: 'jewish-holiday', description: 'Beginning of Av, a month associated with mourning due to the destruction of the First and Second Temples.', categories: ['jewish-holiday'] },
  
  // August 2025 (Av – Elul 5785)
  { name: 'Shabbat Chazon', date: '2025-08-02', type: 'jewish-holiday', description: 'Sabbath before Tish\'a B\'Av, named after the Haftarah reading from Isaiah, which warns of destruction but offers hope.', categories: ['jewish-holiday'] },
  { name: 'Erev Tish\'a B\'Av', date: '2025-08-02', type: 'jewish-holiday', description: 'Eve of the fast commemorating the destruction of the Temples, with preparations including a simple meal before sunset.', categories: ['jewish-holiday'] },
  { name: 'Tish\'a B\'Av', date: '2025-08-03', type: 'jewish-holiday', description: 'Ninth of Av is a major fast day mourning the destruction of the First and Second Temples and other Jewish tragedies.', categories: ['jewish-holiday'] },
  { name: 'Tu B\'Av', date: '2025-08-09', type: 'jewish-holiday', description: '15th of Av is a minor holiday celebrating love and joy, historically a day when unmarried women sought matches.', categories: ['jewish-holiday'] },
  { name: 'Shabbat Nachamu', date: '2025-08-09', type: 'jewish-holiday', description: 'Sabbath of Comfort follows Tish\'a B\'Av, named after the Haftarah from Isaiah offering consolation.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur Katan', date: '2025-08-21', type: 'jewish-holiday', description: 'Minor Day of Atonement before Rosh Chodesh Elul, with fasting and penitential prayers.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Elul (Day 1)', date: '2025-08-24', type: 'jewish-holiday', description: 'Beginning of Elul, a month of introspection and preparation for Rosh Hashanah, with daily shofar blowing.', categories: ['jewish-holiday'] },
  { name: 'Rosh Hashana LaBehemot', date: '2025-08-25', type: 'jewish-holiday', description: 'New Year for Animals, a minor observance tied to livestock tithing in ancient times.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Elul (Day 2)', date: '2025-08-25', type: 'jewish-holiday', description: 'Second day of Rosh Chodesh Elul, emphasizing spiritual preparation for the High Holidays.', categories: ['jewish-holiday'] },
  
  // September 2025 (Elul 5785 – Tishrei 5786)
  { name: 'Leil Selichot', date: '2025-09-13', type: 'jewish-holiday', description: 'Marks the start of reciting Selichot (penitential prayers) in preparation for Rosh Hashanah and Yom Kippur.', categories: ['jewish-holiday'] },
  { name: 'Erev Rosh Hashanah', date: '2025-09-22', type: 'jewish-holiday', description: 'Eve of the Jewish New Year, with festive meals, candle lighting, and preparation for holiday prayers.', categories: ['jewish-holiday'] },
  { name: 'Rosh Hashanah 5786 (Day 1)', date: '2025-09-23', type: 'jewish-holiday', description: 'Jewish New Year marking the creation of the world. Includes shofar blowing, special liturgies, and symbolic foods.', categories: ['jewish-holiday'] },
  { name: 'Rosh Hashanah (Day 2)', date: '2025-09-24', type: 'jewish-holiday', description: 'Second day of Rosh Hashanah with continued observances, prayers, and shofar blowing.', categories: ['jewish-holiday'] },
  { name: 'Tzom Gedaliah', date: '2025-09-25', type: 'jewish-holiday', description: 'Fast day commemorating the assassination of Gedaliah ben Achikam, which ended Jewish autonomy after the First Temple\'s destruction.', categories: ['jewish-holiday'] },
  { name: 'Shabbat Shuva', date: '2025-09-27', type: 'jewish-holiday', description: 'Sabbath between Rosh Hashanah and Yom Kippur, emphasizing repentance and spiritual preparation.', categories: ['jewish-holiday'] },
  
  // October 2025 (Tishrei – Cheshvan 5786)
  { name: 'Erev Yom Kippur', date: '2025-10-01', type: 'jewish-holiday', description: 'Eve of the Day of Atonement, with a festive meal before fast, candle lighting, and Kol Nidre prayer.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur', date: '2025-10-02', type: 'jewish-holiday', description: 'Holiest day in the Jewish calendar for fasting, prayer, and repentance. Includes five prayer services and abstaining from physical comforts.', categories: ['jewish-holiday'] },
  { name: 'Yizkor (Yom Kippur)', date: '2025-10-02', type: 'jewish-holiday', description: 'Memorial prayer for deceased relatives recited during Yom Kippur services.', categories: ['jewish-holiday'] },
  { name: 'Erev Sukkot', date: '2025-10-06', type: 'jewish-holiday', description: 'Eve of the Feast of Tabernacles, with preparations including building a sukkah and gathering the four species.', categories: ['jewish-holiday'] },
  { name: 'Sukkot I', date: '2025-10-07', type: 'jewish-holiday', description: 'Feast of Tabernacles commemorating the Israelites\' desert wanderings. Observed by dwelling in a sukkah and using the four species.', categories: ['jewish-holiday'] },
  { name: 'Sukkot II (CH\'\'M)', date: '2025-10-08', type: 'jewish-holiday', description: 'Second day of Sukkot with continued holiday rituals in the Diaspora, with lighter work restrictions.', categories: ['jewish-holiday'] },
  { name: 'Sukkot III (CH\'\'M)', date: '2025-10-09', type: 'jewish-holiday', description: 'Third day of Sukkot (Chol HaMoed), intermediate day with continued dwelling in the sukkah and use of the four species.', categories: ['jewish-holiday'] },
  { name: 'Sukkot IV (CH\'\'M)', date: '2025-10-10', type: 'jewish-holiday', description: 'Fourth day of Sukkot (Chol HaMoed), intermediate day with partial work restrictions and festive observances.', categories: ['jewish-holiday'] },
  { name: 'Sukkot V (CH\'\'M)', date: '2025-10-11', type: 'jewish-holiday', description: 'Fifth day of Sukkot (Chol HaMoed), intermediate day with continued sukkah dwelling and festive activities.', categories: ['jewish-holiday'] },
  { name: 'Sukkot VI (CH\'\'M)', date: '2025-10-12', type: 'jewish-holiday', description: 'Sixth day of Sukkot (Chol HaMoed), final intermediate day before Hoshana Rabba.', categories: ['jewish-holiday'] },
  { name: 'Sukkot VII (Hoshana Raba)', date: '2025-10-13', type: 'jewish-holiday', description: 'Seventh day of Sukkot with special prayers and circling the synagogue with the four species. Considered a day when divine judgments are finalized.', categories: ['jewish-holiday'] },
  { name: 'Shemini Atzeret', date: '2025-10-14', type: 'jewish-holiday', description: 'Eighth Day of Assembly, a distinct holiday following Sukkot, marked by prayers for rain and festive meals.', categories: ['jewish-holiday'] },
  { name: 'Simchat Torah', date: '2025-10-14', type: 'jewish-holiday', description: 'Celebration of completing and beginning anew the annual Torah reading cycle, marked by dancing with Torah scrolls and festive rejoicing.', categories: ['jewish-holiday'] },
  { name: 'Yizkor (Shemini Atzeret)', date: '2025-10-14', type: 'jewish-holiday', description: 'Memorial prayer for deceased relatives recited during Shemini Atzeret.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Cheshvan (Day 1)', date: '2025-10-22', type: 'jewish-holiday', description: 'Beginning of the month of Cheshvan, with special prayers and Torah readings.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Cheshvan (Day 2)', date: '2025-10-23', type: 'jewish-holiday', description: 'Second day of Rosh Chodesh Cheshvan with continued observances.', categories: ['jewish-holiday'] },
  { name: 'Yom HaAliyah School Observance', date: '2025-10-29', type: 'jewish-holiday', description: 'Celebrates Jewish immigration to Israel (aliyah) and honors the contributions of immigrants to the state.', categories: ['jewish-holiday'] },
  
  // November 2025 (Cheshvan – Kislev 5786)
  { name: 'Yitzhak Rabin Memorial Day', date: '2025-11-03', type: 'jewish-holiday', description: 'Commemorates the assassination of Israeli Prime Minister Yitzhak Rabin in 1995.', categories: ['jewish-holiday'] },
  { name: 'Sigd', date: '2025-11-20', type: 'jewish-holiday', description: 'Ethiopian Jewish holiday observed 50 days after Yom Kippur, celebrating connection to Jerusalem and the Torah.', categories: ['jewish-holiday'] },
  { name: 'Yom Kippur Katan', date: '2025-11-20', type: 'jewish-holiday', description: 'Minor Day of Atonement before Rosh Chodesh Kislev, with fasting and penitential prayers.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Kislev', date: '2025-11-21', type: 'jewish-holiday', description: 'Beginning of Kislev, the month of Chanukah, with special prayers and Torah readings.', categories: ['jewish-holiday'] },
  { name: 'Ben-Gurion Day', date: '2025-11-26', type: 'jewish-holiday', description: 'Honors David Ben-Gurion, Israel\'s first Prime Minister, recognizing his role in founding the state.', categories: ['jewish-holiday'] },
  
  // December 2025 (Kislev – Tevet 5786)
  { name: 'Chanukah (1st Day)', date: '2025-12-14', type: 'jewish-holiday', description: 'First day of the Festival of Lights commemorating the rededication of the Second Temple after the Maccabean victory.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (2nd Day)', date: '2025-12-15', type: 'jewish-holiday', description: 'Second day of Chanukah, lighting two candles on the menorah to symbolize the miracle of the oil lasting eight days.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (3rd Day)', date: '2025-12-16', type: 'jewish-holiday', description: 'Third day of Chanukah, continuing the celebration with three candles on the menorah.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (4th Day)', date: '2025-12-17', type: 'jewish-holiday', description: 'Fourth day of Chanukah, marking the halfway point of the festival with four candles.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (5th Day)', date: '2025-12-18', type: 'jewish-holiday', description: 'Fifth day of Chanukah, continuing with five candles on the menorah and traditional foods and games.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (6th Day)', date: '2025-12-19', type: 'jewish-holiday', description: 'Sixth day of Chanukah, celebrating with six candles on the menorah and commemoration of the Maccabean victory.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (7th Day)', date: '2025-12-21', type: 'jewish-holiday', description: 'Seventh day of Chanukah, nearing the completion of the festival with seven candles on the menorah.', categories: ['jewish-holiday'] },
  { name: 'Chanukah (8th Day)', date: '2025-12-22', type: 'jewish-holiday', description: 'Final day of Chanukah, completing the eight-day celebration with the lighting of all candles on the menorah.', categories: ['jewish-holiday'] },
  { name: 'Chag HaBanot', date: '2025-12-20', type: 'jewish-holiday', description: 'Festival of Daughters observed by North African Jewish communities during Chanukah, honoring women\'s contributions to Jewish life.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Tevet (Day 1)', date: '2025-12-20', type: 'jewish-holiday', description: 'Beginning of Tevet, with special prayers coinciding with Chanukah.', categories: ['jewish-holiday'] },
  { name: 'Rosh Chodesh Tevet (Day 2)', date: '2025-12-21', type: 'jewish-holiday', description: 'Second day of Rosh Chodesh Tevet with continued observances during Chanukah.', categories: ['jewish-holiday'] },
  { name: 'Asara B\'Tevet', date: '2025-12-30', type: 'jewish-holiday', description: 'Tenth of Tevet fast day commemorating the siege of Jerusalem by Nebuchadnezzar in 587 BCE, leading to the First Temple\'s destruction.', categories: ['jewish-holiday'] },
  
  // Iran Holidays
  { name: 'Nationalization of the Oil Industry (11 Khordad)', date: '2025-06-01', type: 'iran-holiday', description: 'Celebrates the nationalization of Iran\'s oil industry in 1951 under Prime Minister Mohammad Mossadegh, a significant step toward economic independence from foreign control. Observed with educational events and discussions on Iran\'s economic history.', categories: ['iran-holiday'] },
  { name: 'Demise of Imam Khomeini (Khordad 14)', date: '2025-06-04', type: 'iran-holiday', description: 'Commemorates the passing of Ayatollah Ruhollah Khomeini, leader of the 1979 Islamic Revolution. A national day of mourning marked by ceremonies, speeches, and visits to his mausoleum in Tehran.', categories: ['iran-holiday'] },
  { name: 'Khordad National Uprising (Khordad 15)', date: '2025-06-05', type: 'iran-holiday', description: 'Anniversary of the 1963 protests against the arrest of Ayatollah Khomeini. This pivotal event leading to the 1979 Islamic Revolution is observed with official ceremonies and historical reflections.', categories: ['iran-holiday'] },
  { name: 'Eid-e-Qorban (Feast of the Sacrifice)', date: '2025-06-07', type: 'iran-holiday', description: 'Also known as Eid al-Adha, this holiday celebrates Prophet Abraham\'s obedience to God. Observed with prayers, animal sacrifices, distribution of meat to the poor, and family gatherings.', categories: ['iran-holiday'] },
  { name: 'Eid-e-Ghadir (Dhu al-Hijjah 18)', date: '2025-06-14', type: 'iran-holiday', description: 'Significant Shia holiday commemorating Prophet Muhammad\'s appointment of Imam Ali as his successor at Ghadir Khumm. Celebrated with communal prayers, lectures, and expressions of devotion.', categories: ['iran-holiday'] },
  { name: 'Tasoua Hosseini (Muharram 9)', date: '2025-07-05', type: 'iran-holiday', description: 'The ninth day of Muharram, dedicated to mourning Imam Hossein, grandson of Prophet Muhammad. Involves processions, elegies, and preparations for Ashoura.', categories: ['iran-holiday'] },
  { name: 'Ashoura (Muharram 10)', date: '2025-07-05', type: 'iran-holiday', description: 'Marks the martyrdom of Imam Hossein in the Battle of Karbala in 680 CE. One of the most important days in Shia Islam, observed with intense mourning rituals, chest-beating, passion plays, and processions.', categories: ['iran-holiday'] },
  { name: 'Arbaeen (Safar 20)', date: '2025-08-14', type: 'iran-holiday', description: 'Marks 40 days after Ashoura, commemorating the end of the mourning period for Imam Hossein. Millions participate in pilgrimages to Karbala, Iraq, with gatherings and charity events throughout Iran.', categories: ['iran-holiday'] },
  { name: 'Death of Prophet Muhammad / Martyrdom of Imam Hassan (Safar 28)', date: '2025-08-23', type: 'iran-holiday', description: 'Commemorates both the passing of Prophet Muhammad (632 CE) and the martyrdom of Imam Hassan (670 CE). A day of mourning with religious gatherings, Quran recitations, and sermons.', categories: ['iran-holiday'] },
  { name: 'Martyrdom of Imam Reza (Safar 30)', date: '2025-08-25', type: 'iran-holiday', description: 'Marks the martyrdom of Imam Reza (818 CE), the eighth Shia Imam. Observed with mourning ceremonies across Iran, with many pilgrims visiting his shrine in Mashhad.', categories: ['iran-holiday'] },
  { name: 'Martyrdom of Imam Hassan Asgari (Rabi\'ul-Awwal 8)', date: '2025-09-01', type: 'iran-holiday', description: 'Commemorates the martyrdom of the eleventh Shia Imam (874 CE). Observed with mourning rituals, particularly in Qom, and marks the beginning of celebrations for Imam Mahdi\'s birth.', categories: ['iran-holiday'] },
  { name: 'Birthday of Muhammad and Imam Sadegh (Rabi\'ul-Awwal 17)', date: '2025-09-05', type: 'iran-holiday', description: 'Celebrates the birth of Prophet Muhammad (570 CE) and Imam Ja\'far Sadegh (702 CE). Part of "Unity Week" between Sunni and Shia Muslims, with prayers, lectures, and charitable acts.', categories: ['iran-holiday'] },
  { name: 'Martyrdom of Hazrat Fatimah (Jumada al-Thani 3)', date: '2025-11-24', type: 'iran-holiday', description: 'Commemorates Hazrat Fatimah, daughter of Prophet Muhammad and mother of Imam Hossein, believed martyred in 632 CE. Known as Fatimiyyah, observed with mourning ceremonies focusing on her virtues and hardships.', categories: ['iran-holiday'] },
  
  // Astrology
  // May 2025
  { name: 'Sun Enters Gemini', date: '2025-05-20', type: 'astrology', description: 'The Sun moves into Gemini, encouraging clear communication, curiosity, and social connections. A great time to learn something new, share ideas, or strengthen relationships.', categories: ['astrology'] },
  { name: 'Jupiter Enters Cancer', date: '2025-05-27', type: 'astrology', description: 'Jupiter moves into Cancer for about a year, emphasizing home, family, and emotional well-being. A time to nurture loved ones, create a cozy environment, and trust your instincts.', categories: ['astrology'] },
  
  // June 2025
  { name: 'Mercury Retrograde Begins in Cancer', date: '2025-06-06', type: 'astrology', description: 'Mercury appears to move backward in Cancer for about three weeks, potentially causing misunderstandings in family matters or home-related plans. Time to slow down and reflect.', categories: ['astrology'] },
  { name: 'Sun Enters Cancer (Summer Solstice)', date: '2025-06-21', type: 'astrology', description: 'The Sun enters Cancer, marking the Summer Solstice and longest day of the year. This month-long period focuses on family, home, and emotional comfort.', categories: ['astrology'] },
  { name: 'Mercury Stations Direct in Cancer', date: '2025-06-30', type: 'astrology', description: 'Mercury ends its retrograde and resumes normal motion, clearing up communication issues from the past few weeks. Good time to move forward with delayed plans.', categories: ['astrology'] },
  
  // July 2025
  { name: 'Sun Enters Leo', date: '2025-07-22', type: 'astrology', description: 'The Sun moves into Leo, bringing a month of energy, creativity, and confidence. Time to express yourself, take the lead, and showcase your talents.', categories: ['astrology'] },
  
  // August 2025
  { name: 'Venus Retrograde Begins in Virgo', date: '2025-08-07', type: 'astrology', description: 'Venus appears to move backward in Virgo for about six weeks, encouraging reassessment of relationships, self-worth, or finances. A time to consider what truly matters.', categories: ['astrology'] },
  { name: 'Sun Enters Virgo', date: '2025-08-22', type: 'astrology', description: 'The Sun enters Virgo, starting a month focused on organization, health, and helping others. Excellent time to improve routines or solve problems practically.', categories: ['astrology'] },
  
  // September 2025
  { name: 'Total Lunar Eclipse in Pisces', date: '2025-09-07', type: 'astrology', description: 'A lunar eclipse in Pisces creates a powerful moment for emotions and intuition. May bring hidden feelings to light, encouraging release of what no longer serves you.', categories: ['astrology'] },
  { name: 'Sun Enters Libra (Autumnal Equinox)', date: '2025-09-22', type: 'astrology', description: 'The Sun moves into Libra, marking the Autumnal Equinox when day and night are equal. This month emphasizes relationships, balance, and harmony.', categories: ['astrology'] },
  
  // October 2025
  { name: 'Annular Solar Eclipse in Libra', date: '2025-10-21', type: 'astrology', description: 'A solar eclipse in Libra highlights relationships and fairness. May spark new beginnings in partnerships, encouraging balance and resolution of conflicts.', categories: ['astrology'] },
  { name: 'Sun Enters Scorpio', date: '2025-10-23', type: 'astrology', description: 'The Sun enters Scorpio, beginning a month of deep emotions and transformation. Time to explore inner thoughts, uncover truths, and focus on meaningful change.', categories: ['astrology'] },
  
  // November 2025
  { name: 'Sun Enters Sagittarius', date: '2025-11-22', type: 'astrology', description: 'The Sun moves into Sagittarius, starting a month of adventure and optimism. This period inspires exploration of new ideas, travel, or broadening your perspective.', categories: ['astrology'] },
  
  // December 2025
  { name: 'Mercury Retrograde Begins in Capricorn', date: '2025-12-15', type: 'astrology', description: 'Mercury appears to move backward in Capricorn for about three weeks, potentially causing delays in career plans or long-term goals. Time to review ambitions.', categories: ['astrology'] },
  { name: 'Sun Enters Capricorn (Winter Solstice)', date: '2025-12-21', type: 'astrology', description: 'The Sun enters Capricorn, marking the Winter Solstice, the shortest day of the year. This month focuses on discipline, hard work, and planning for the future.', categories: ['astrology'] },
  
  // Astronomy Events
  { name: 'Moon near Antares', date: '2025-05-14', type: 'astronomy', description: 'Conjunction of the Moon with the star Antares in Scorpius, observable with naked eye or binoculars.', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-05-27', type: 'astronomy', description: 'Moon is positioned between Earth and Sun, ideal for observing faint celestial objects.', categories: ['astronomy'] },
  { name: 'Venus at Greatest Western Elongation', date: '2025-05-31', type: 'astronomy', description: 'Venus reaches its highest point in the morning sky, best viewed before sunrise.', categories: ['astronomy'] },
  { name: 'Venus at greatest elongation west', date: '2025-06-01', type: 'astronomy', description: 'Venus is visible in the eastern sky before sunrise, at its maximum angular distance from the Sun.', categories: ['astronomy'] },
  { name: 'Moon near Mars', date: '2025-06-01', type: 'astronomy', description: 'Conjunction of the Moon with Mars, observable with naked eye or binoculars.', categories: ['astronomy'] },
  { name: 'Moon near Antares', date: '2025-06-10', type: 'astronomy', description: 'Another conjunction of the Moon with Antares, similar to May 14, in Scorpius.', categories: ['astronomy'] },
  { name: 'Full Moon (Strawberry Moon)', date: '2025-06-11', type: 'astronomy', description: 'Moon fully illuminated, known as Strawberry Moon, visible worldwide.', categories: ['astronomy'] },
  { name: 'Moon near Saturn, Moon near Neptune', date: '2025-06-19', type: 'astronomy', description: 'Conjunctions of the Moon with Saturn and Neptune, requiring binoculars or telescopes for Neptune.', categories: ['astronomy'] },
  { name: 'June Solstice', date: '2025-06-21', type: 'astronomy', description: 'Marks the start of summer in the Northern Hemisphere and winter in the Southern Hemisphere.', categories: ['astronomy'] },
  { name: 'Moon near Uranus, Moon near Pleiades', date: '2025-06-23', type: 'astronomy', description: 'Conjunctions with Uranus (telescopic) and the Pleiades star cluster (naked eye or binoculars).', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-06-25', type: 'astronomy', description: 'Another moonlight-free night, optimal for deep-sky observation.', categories: ['astronomy'] },
  { name: 'Moon near Mars, lunar occultation of Mars', date: '2025-06-30', type: 'astronomy', description: 'Mars is temporarily hidden behind the Moon, visible over western Peru, Ecuador, and western Colombia.', categories: ['astronomy'] },
  { name: 'Mercury at greatest elongation west', date: '2025-07-04', type: 'astronomy', description: 'Mercury visible low in the western sky after sunset, at its maximum angular distance from the Sun.', categories: ['astronomy'] },
  { name: 'Uranus near Venus', date: '2025-07-04', type: 'astronomy', description: 'Conjunction of Uranus and Venus, with Venus visible to the naked eye and Uranus requiring binoculars.', categories: ['astronomy'] },
  { name: 'Full Moon (Buck Moon)', date: '2025-07-10', type: 'astronomy', description: 'Known as Buck Moon, fully illuminated, significant for new antler growth in deer.', categories: ['astronomy'] },
  { name: 'Moon near Saturn, Moon near Neptune', date: '2025-07-16', type: 'astronomy', description: 'Conjunctions similar to June 19, with Neptune requiring telescopic observation.', categories: ['astronomy'] },
  { name: 'Moon near Pleiades', date: '2025-07-20', type: 'astronomy', description: 'Conjunction with the Pleiades star cluster, observable with naked eye or binoculars.', categories: ['astronomy'] },
  { name: 'Moon near Jupiter', date: '2025-07-23', type: 'astronomy', description: 'Conjunction of the Moon with Jupiter, visible to the naked eye.', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-07-24', type: 'astronomy', description: 'Moonlight-free night, ideal for stargazing.', categories: ['astronomy'] },
  { name: 'Moon near Mars, lunar occultation of Mars', date: '2025-07-28', type: 'astronomy', description: 'Another occultation, visible over a part of Antarctica, with Mars temporarily hidden.', categories: ['astronomy'] },
  { name: 'Delta Aquarids Meteor Shower', date: '2025-07-28', type: 'astronomy', description: 'Up to 20 meteors per hour, peaks overnight, best viewed after midnight from dark locations.', categories: ['astronomy'] },
  { name: 'Southern δ-Aquariid meteor shower peak', date: '2025-07-30', type: 'astronomy', description: 'A subset of Delta Aquarids, up to 25 meteors per hour, best observed from the Southern Hemisphere.', categories: ['astronomy'] },
  { name: 'Full Moon (Sturgeon Moon)', date: '2025-08-09', type: 'astronomy', description: 'Known as Sturgeon Moon, fully illuminated, significant for historical fishing periods.', categories: ['astronomy'] },
  { name: '6 planets in planetary alignment', date: '2025-08-11', type: 'astronomy', description: 'Mercury, Jupiter, Venus, Uranus, Neptune, and Saturn align in the morning sky, with some requiring telescopes.', categories: ['astronomy'] },
  { name: 'Perseid Meteor Shower', date: '2025-08-11', type: 'astronomy', description: 'Up to 100 meteors per hour, peaks overnight, one of the year\'s best shows, though moonlight may affect visibility.', categories: ['astronomy'] },
  { name: 'Venus near Jupiter, Moon near Saturn', date: '2025-08-12', type: 'astronomy', description: 'Conjunctions of Venus with Jupiter (naked eye) and Moon with Saturn (naked eye or binoculars).', categories: ['astronomy'] },
  { name: 'Mercury at Greatest Western Elongation', date: '2025-08-19', type: 'astronomy', description: 'Mercury visible low in the eastern sky before sunrise, at its maximum angular distance.', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-08-23', type: 'astronomy', description: 'Moonlight-free night, optimal for deep-sky observation.', categories: ['astronomy'] },
  { name: 'Full Moon, Total Lunar Eclipse (Corn Moon)', date: '2025-09-07', type: 'astronomy', description: 'Total lunar eclipse visible in Asia, Australia, Europe, and Africa, Moon turns rusty or blood red.', categories: ['astronomy'] },
  { name: 'New Moon, Partial Solar Eclipse', date: '2025-09-21', type: 'astronomy', description: 'Partial solar eclipse visible in New Zealand, Antarctica, and southern Pacific, with 76% coverage in New Zealand.', categories: ['astronomy'] },
  { name: 'Saturn at Opposition', date: '2025-09-21', type: 'astronomy', description: 'Saturn brightest and visible all night, best for viewing with medium to large telescopes.', categories: ['astronomy'] },
  { name: 'September Equinox', date: '2025-09-22', type: 'astronomy', description: 'Marks the start of fall in the Northern Hemisphere and spring in the Southern Hemisphere.', categories: ['astronomy'] },
  { name: 'Neptune at Opposition', date: '2025-09-23', type: 'astronomy', description: 'Neptune brightest and visible all night, appears as a tiny blue dot, best viewed with powerful telescopes.', categories: ['astronomy'] },
  { name: 'Full Moon, Supermoon (Hunters Moon)', date: '2025-10-07', type: 'astronomy', description: 'First of three supermoons, may look larger and brighter, known as Hunters Moon.', categories: ['astronomy'] },
  { name: 'Draconids Meteor Shower', date: '2025-10-07', type: 'astronomy', description: 'Up to 10 meteors per hour, peaks overnight, but nearly full moon may block most, best early evening.', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-10-21', type: 'astronomy', description: 'Moonlight-free night, ideal for stargazing.', categories: ['astronomy'] },
  { name: 'Orionids Meteor Shower', date: '2025-10-21', type: 'astronomy', description: 'Up to 20 meteors per hour, peaks overnight, excellent show with no moonlight interference.', categories: ['astronomy'] },
  { name: 'Mercury at Greatest Eastern Elongation', date: '2025-10-29', type: 'astronomy', description: 'Mercury visible low in the western sky after sunset, at its maximum angular distance.', categories: ['astronomy'] },
  { name: 'Taurids Meteor Shower', date: '2025-11-04', type: 'astronomy', description: '5-10 meteors per hour, peaks overnight, full moon may hide most, best after midnight.', categories: ['astronomy'] },
  { name: 'Full Moon, Supermoon (Beaver Moon)', date: '2025-11-05', type: 'astronomy', description: 'Second of three supermoons, may look larger and brighter, known as Beaver Moon.', categories: ['astronomy'] },
  { name: 'Leonids Meteor Shower', date: '2025-11-17', type: 'astronomy', description: 'Up to 15 meteors per hour, peaks overnight, crescent moon not a problem, excellent show.', categories: ['astronomy'] },
  { name: 'New Moon (Micro New Moon)', date: '2025-11-20', type: 'astronomy', description: 'Moon near farthest point from Earth, best for night sky exploration.', categories: ['astronomy'] },
  { name: 'Uranus at Opposition', date: '2025-11-21', type: 'astronomy', description: 'Uranus brightest and visible all night, appears as a tiny blue-green dot, best with telescopes.', categories: ['astronomy'] },
  { name: 'Full Moon, Supermoon (Cold Moon)', date: '2025-12-04', type: 'astronomy', description: 'Last of three supermoons, may look larger and brighter, known as Cold Moon.', categories: ['astronomy'] },
  { name: 'Mercury at Greatest Western Elongation', date: '2025-12-07', type: 'astronomy', description: 'Mercury visible low in the eastern sky before sunrise, at its maximum angular distance.', categories: ['astronomy'] },
  { name: 'Geminid Meteor Shower', date: '2025-12-13', type: 'astronomy', description: 'Peaks overnight, up to 120 meteors per hour, one of the year\'s best, visible worldwide.', categories: ['astronomy'] },
  { name: 'New Moon', date: '2025-12-20', type: 'astronomy', description: 'Final new moon of 2025, invisible phase, ideal for stargazing.', categories: ['astronomy'] },

  // Global Elections
  { name: 'Poland Presidential Election', date: '2025-05-18', type: 'election', description: 'First round of presidential elections in Poland.', categories: ['election'] },
  { name: 'Portugal Parliamentary Election', date: '2025-05-18', type: 'election', description: 'Elections for the Portuguese Parliament.', categories: ['election'] },
  { name: 'Romania Presidential Election', date: '2025-05-18', type: 'election', description: 'Second round of presidential elections in Romania.', categories: ['election'] },
  { name: 'Suriname Parliamentary Election', date: '2025-05-25', type: 'election', description: 'Elections for the Parliament of Suriname.', categories: ['election'] },
  { name: 'Venezuela Parliamentary Election', date: '2025-05-25', type: 'election', description: 'Elections for the Parliament of Venezuela.', categories: ['election'] },
  { name: 'Mexico Judiciary Election', date: '2025-06-01', type: 'election', description: 'Elections for the Judiciary in Mexico.', categories: ['election'] },
  { name: 'South Korea Presidential Election', date: '2025-06-03', type: 'election', description: 'Presidential elections in South Korea.', categories: ['election'] },
  { name: 'Burundi Parliamentary Election', date: '2025-06-05', type: 'election', description: 'Elections for the National Assembly and Senate of Burundi.', categories: ['election'] },
  { name: 'Italy Referendum', date: '2025-06-08', type: 'election', description: 'Referendum in Italy (continuing on June 9).', categories: ['election'] },
  { name: 'Japan House of Councillors Election', date: '2025-07-01', type: 'election', description: 'Elections for the House of Councillors in Japan.', categories: ['election'] },
  { name: 'Bolivia General Election', date: '2025-08-17', type: 'election', description: 'Presidential, Chamber of Deputies and Senate elections in Bolivia.', categories: ['election'] },
  { name: 'Saint Helena Parliamentary Election', date: '2025-09-03', type: 'election', description: 'Elections for the Parliament of Saint Helena.', categories: ['election'] },
  { name: 'Norway Parliamentary Election', date: '2025-09-08', type: 'election', description: 'Elections for the Parliament of Norway.', categories: ['election'] },
  { name: 'Macau Parliamentary Election', date: '2025-09-14', type: 'election', description: 'Elections for the Parliament of Macau.', categories: ['election'] },
  { name: 'Malawi General Election', date: '2025-09-16', type: 'election', description: 'Presidential and Parliamentary elections in Malawi.', categories: ['election'] },
  { name: 'Guinea Constitutional Referendum', date: '2025-09-21', type: 'election', description: 'Constitutional Referendum in Guinea.', categories: ['election'] },
  { name: 'Seychelles General Election', date: '2025-09-27', type: 'election', description: 'Presidential and Parliamentary elections in Seychelles.', categories: ['election'] },
  { name: 'Moldova Parliamentary Election', date: '2025-09-28', type: 'election', description: 'Elections for the Parliament of Moldova.', categories: ['election'] },
  { name: 'Czech Republic Parliamentary Election', date: '2025-10-03', type: 'election', description: 'Elections for the Chamber of Deputies in Czech Republic (continuing on October 4).', categories: ['election'] },
  { name: 'Cameroon Presidential Election', date: '2025-10-05', type: 'election', description: 'Presidential elections in Cameroon.', categories: ['election'] },
  { name: 'Ivory Coast Presidential Election', date: '2025-10-25', type: 'election', description: 'Presidential elections in Ivory Coast.', categories: ['election'] },
  { name: 'Argentina Parliamentary Election', date: '2025-10-26', type: 'election', description: 'Elections for the Chamber of Deputies and Senate in Argentina.', categories: ['election'] },
  { name: 'Tanzania General Election', date: '2025-10-28', type: 'election', description: 'Presidential and Parliamentary elections in Tanzania.', categories: ['election'] },
  { name: 'Iraq Parliamentary Election', date: '2025-11-11', type: 'election', description: 'Elections for the Parliament of Iraq.', categories: ['election'] },
  { name: 'Haiti General Election', date: '2025-11-15', type: 'election', description: 'Presidential, Chamber of Deputies and Senate elections in Haiti.', categories: ['election'] },
  { name: 'Chile General Election', date: '2025-11-16', type: 'election', description: 'First round of Presidential elections, along with Chamber of Deputies and Senate elections in Chile.', categories: ['election'] },
  { name: 'Guinea-Bissau General Election', date: '2025-11-23', type: 'election', description: 'Presidential and Parliamentary elections in Guinea-Bissau.', categories: ['election'] },
  { name: 'Honduras General Election', date: '2025-11-30', type: 'election', description: 'Presidential and Parliamentary elections in Honduras.', categories: ['election'] },
  { name: 'Transnistria Parliamentary Election', date: '2025-11-30', type: 'election', description: 'Elections for the Parliament of Transnistria.', categories: ['election'] },
  { name: 'Hong Kong Legislative Council Election', date: '2025-12-07', type: 'election', description: 'Elections for the Legislative Council of Hong Kong.', categories: ['election'] }
];

// Function to get the days in a month
const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

// Function to get the first day of the month (0 = Sunday)
const getFirstDayOfMonth = (month: number, year: number) => {
  return new Date(year, month, 1).getDay();
};



// Helper function to check if a date is a special date
// Returns an array of all matching special events for the date, or null if none
const isSpecialDate = (date: Date, enabledCategories: CalendarType[] = []) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();
  
  // Format as YYYY-MM-DD
  const formattedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  // If no categories are enabled, return null
  if (!enabledCategories || enabledCategories.length === 0) {
    return null;
  }
  
  // Filter special dates by enabled categories
  const events = SPECIAL_DATES.filter(specialDate => 
    specialDate.date === formattedDate && 
    specialDate.categories.some(category => enabledCategories.includes(category as CalendarType))
  );
  
  return events.length > 0 ? events : null;
};

// Get color for a special date based on the first matching category
const getSpecialDateColor = (specialDate: typeof SPECIAL_DATES[0]) => {
  if (!specialDate || !specialDate.categories || specialDate.categories.length === 0) {
    return '';
  }
  
  // Find the first matching calendar type
  const calendarType = CALENDAR_TYPES.find(type => 
    specialDate.categories.includes(type.id)
  );
  
  return calendarType ? calendarType.color : '';
};

// Function to generate the calendar for a specific month
function MonthCalendar({ 
  month, 
  year, 
  currentDate,
  onDateClick,
  enabledCategories
}: { 
  month: number, 
  year: number,
  currentDate: Date,
  onDateClick: (date: Date) => void,
  enabledCategories: CalendarType[]
}) {
  // For calendar display, convert month index from 0-based (May=0) to 4-11 (May-Dec)
  const displayMonth = month + 4;
  
  const daysInMonth = getDaysInMonth(displayMonth, year);
  const firstDay = getFirstDayOfMonth(displayMonth, year);
  
  // Create blank days for the start of the month
  const blanks = Array(firstDay).fill(null).map((_, i) => (
    <div key={`blank-${i}`} className="h-8 w-8"></div>
  ));
  
  // Create days of the month
  const days = Array(daysInMonth).fill(null).map((_, i) => {
    const day = i + 1;
    const date = new Date(year, displayMonth, day);
    const specialEvents = isSpecialDate(date, enabledCategories);
    const hasMultipleEvents = specialEvents && specialEvents.length > 1;
    
    // Check if this is today's date
    const isToday = currentDate && 
                   currentDate.getDate() === day && 
                   currentDate.getMonth() === displayMonth && 
                   currentDate.getFullYear() === year;
    
    // Check if date is in the past
    const isPastDate = new Date(year, displayMonth, day) < new Date(new Date().setHours(0, 0, 0, 0));
    
    // Get the color for special date based on first event
    let specialColor = specialEvents && specialEvents.length > 0 ? getSpecialDateColor(specialEvents[0]) : '';
    
    // Style different holiday types
    let specialClassNames = 'hover:bg-accent';
    if (isToday) {
      specialClassNames = 'bg-blue-500 hover:bg-blue-600 text-white font-bold ring-2 ring-blue-300';
    } else if (specialEvents && specialEvents.length > 0) {
      // Use the color from the calendar type
      const colorClasses = specialColor.split(' ');
      const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
      const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
      
      specialClassNames = `${bgClass} hover:${bgClass.replace('bg-', 'bg-')}/80 ${textClass} font-medium`;
    }
    
    // Apply opacity to past dates
    if (isPastDate) {
      specialClassNames += ' opacity-40';
    }
    
    // Create title text that shows all event names for the tooltip
    const titleText = specialEvents && specialEvents.length > 0 
      ? specialEvents.map(event => event.name).join('\n')
      : undefined;
    
    return (
      <div key={`day-${day}`} className="relative">
        <div 
          onClick={() => onDateClick(date)}
          className={`h-8 w-8 flex items-center justify-center rounded-full text-sm cursor-pointer ${specialClassNames}`}
          title={titleText}
        >
          <span className={hasMultipleEvents ? 'underline decoration-2' : ''}>
            {day}
          </span>
        </div>
      </div>
    );
  });

  // Combine blank days and actual days
  const totalSlots = [...blanks, ...days];
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-center">{MONTHS[month]} {year}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="font-medium text-xs text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {totalSlots}
        </div>
      </CardContent>
    </Card>
  );
}



export default function CalendarPage() {
  const year = 2025;
  const [currentDate, setCurrentDate] = useState(new Date()); // Current date to highlight today
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("calendar");
  // Set all categories enabled by default
  const [enabledCategories, setEnabledCategories] = useState<CalendarType[]>(
    CALENDAR_TYPES.map(c => c.id)
  );
  // State for sorting method in List View: 'date' (by soonest) or 'category'
  const [sortMethod, setSortMethod] = useState<'date' | 'category'>('date');
  
  // State for storing converted dates from different calendar systems
  const [calendarDates, setCalendarDates] = useState({
    julian: '',
    persian: '',
    hebrew: '',
    chinese: '',
    hindu: ''
  });
  
  // Update all calendar dates when the current date changes
  useEffect(() => {
    // Update the current date every minute to keep it accurate
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    // Calculate calendar dates
    updateCalendarDates(currentDate);
    
    // Cleanup on unmount
    return () => clearInterval(interval);
  }, [currentDate]);
  
  // Function to update all calendar dates
  const updateCalendarDates = (date: Date) => {
    try {
      // Calculate Julian date (approximate - 13 days behind Gregorian for modern dates)
      const julianDate = new Date(date);
      julianDate.setDate(julianDate.getDate() - 13);
      const julianDay = julianDate.getDate();
      const julianMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                               'July', 'August', 'September', 'October', 'November', 'December'];
      const julianMonth = julianMonthNames[julianDate.getMonth()];
      const julianYear = julianDate.getFullYear();
      
      // Persian Calendar (Jalali) - using date-fns-jalali
      let persianDate = '';
      try {
        persianDate = formatJalali(date, 'd MMMM yyyy');
      } catch (e) {
        // Fallback to a calculation based on current date
        const month = date.getMonth();
        const persianMonths = ['Farvardin', 'Ordibehesht', 'Khordad', 'Tir', 'Mordad', 'Shahrivar',
                               'Mehr', 'Aban', 'Azar', 'Dey', 'Bahman', 'Esfand'];
        // Approximate Persian year (1404 in 2025)
        const persianYear = date.getFullYear() - 621;
        persianDate = `${date.getDate()} ${persianMonths[month]} ${persianYear}`;
      }
      
      // Hebrew Calendar (approximation)
      // Hebrew calendar has 12-13 months and follows lunar cycles
      const hebrewMonths = [
        'Nisan', 'Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul',
        'Tishri', 'Cheshvan', 'Kislev', 'Tevet', 'Shevat', 'Adar'
      ];
      // Approximate Hebrew year (5785 in 2025)
      const hebrewYear = date.getFullYear() + 3760;
      // Use current date with adjustment for month representation
      const hebrewDay = date.getDate();
      const adjustedMonth = (date.getMonth() + 2) % 12; // Nisan is first month, roughly corresponding to March-April
      const hebrewMonth = hebrewMonths[adjustedMonth];
      
      // Chinese Lunar Calendar (approximation)
      // Chinese zodiac animals in order
      const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
      // Current animal based on year (2025 is Snake year)
      const chineseAnimal = animals[(date.getFullYear() - 4) % 12];
      // Approximate lunar month (this is inaccurate without a proper lunar calendar calculation)
      const chineseMonth = Math.min(12, Math.max(1, date.getMonth() + 1));
      // Use current day of month
      const chineseDay = date.getDate();
      
      // Hindu Calendar (approximated - Vikram Samvat is approx 57 years ahead of Gregorian)
      const hinduYear = date.getFullYear() + 57;
      // Approximate month name
      const hinduMonths = ['Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
                          'Ashvina', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna'];
      const hinduMonth = hinduMonths[date.getMonth()];
      
      setCalendarDates({
        julian: `${julianMonth} ${julianDay}, ${julianYear}`,
        persian: persianDate,
        hebrew: `${hebrewDay} ${hebrewMonth} ${hebrewYear}`,
        chinese: `${chineseAnimal} Year, ${chineseMonth}${getOrdinalSuffix(chineseMonth)} Month, ${chineseDay}${getOrdinalSuffix(chineseDay)} Day`,
        hindu: `${hinduMonth} ${date.getDate()}, ${hinduYear} (Vikram Samvat)`
      });
    } catch (error) {
      console.error("Error calculating calendar dates:", error);
      
      // Set default values if calculation fails
      setCalendarDates({
        julian: format(date, 'MMMM d, yyyy'),
        persian: format(date, 'MMMM d, yyyy'),
        hebrew: format(date, 'MMMM d, yyyy'),
        chinese: format(date, 'MMMM d, yyyy'),
        hindu: format(date, 'MMMM d, yyyy')
      });
    }
  };
  
  // Helper to get Chinese zodiac animal
  const getChineseZodiac = (year: number) => {
    const animals = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];
    return animals[(year - 4) % 12];
  };
  
  // Helper to add ordinal suffix (1st, 2nd, 3rd, etc.)
  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) {
      return "st";
    }
    if (j === 2 && k !== 12) {
      return "nd";
    }
    if (j === 3 && k !== 13) {
      return "rd";
    }
    return "th";
  };
  
  // Check if selected date has special events (now returns array of events)
  const specialEvents = selectedDate ? isSpecialDate(selectedDate, enabledCategories) : null;
  
  // Handler for date click in calendar
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setDialogOpen(true);
  };
  
  // Toggle a calendar category
  const toggleCategory = (category: CalendarType) => {
    setEnabledCategories(current => 
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
  };
  
  // Select all calendar categories
  const selectAllCategories = () => {
    setEnabledCategories(CALENDAR_TYPES.map(c => c.id));
  };
  
  // Clear all calendar categories
  const clearAllCategories = () => {
    setEnabledCategories([]);
  };
  
  return (
    <div className="flex h-screen bg-background">
      <div className="w-full overflow-auto">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary">theOxus.com Calendar</h1>
              <div className="mt-2">
                <p className="text-xl font-semibold text-foreground">
                  <span className="inline-flex items-center">
                    🌐 {format(currentDate, 'EEEE, MMMM d, yyyy')}
                  </span>
                </p>
                
                <div className="mt-2 space-y-0.5">
                  <p className="text-sm font-medium text-muted-foreground">Today is also:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm mt-1">
                    <p>
                      <span className="inline-flex items-center">
                        <span className="text-muted-foreground">☦️ Julian:</span> <span className="font-medium ml-1">{calendarDates.julian}</span>
                      </span>
                    </p>
                    <p>
                      <span className="inline-flex items-center">
                        <span className="text-muted-foreground">🇮🇷 Persian:</span> <span className="font-medium ml-1">{calendarDates.persian}</span>
                      </span>
                    </p>
                    <p>
                      <span className="inline-flex items-center">
                        <span className="text-muted-foreground">✡️ Hebrew:</span> <span className="font-medium ml-1">{calendarDates.hebrew}</span>
                      </span>
                    </p>
                    <p>
                      <span className="inline-flex items-center">
                        <span className="text-muted-foreground">🐲 Chinese:</span> <span className="font-medium ml-1">{calendarDates.chinese}</span>
                      </span>
                    </p>
                    <p>
                      <span className="inline-flex items-center">
                        <span className="text-muted-foreground">🕉️ Hindu:</span> <span className="font-medium ml-1">{calendarDates.hindu}</span>
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Link href="/">
                <Button variant="outline">
                  ← Back to Home
                </Button>
              </Link>
            </div>
          </div>
          
          <Tabs defaultValue="calendar" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="special">List View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="mt-4">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Calendar Categories</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => enabledCategories.length === CALENDAR_TYPES.length ? clearAllCategories() : selectAllCategories()}
                  >
                    {enabledCategories.length === CALENDAR_TYPES.length ? 'Turn All Off' : 'Turn All On'}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CALENDAR_TYPES.map((calType) => {
                    const isEnabled = enabledCategories.includes(calType.id);
                    const colorClasses = calType.color.split(' ');
                    const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
                    const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
                    const borderClass = colorClasses.find(c => c.startsWith('border-')) || '';
                    
                    return (
                      <Badge
                        key={calType.id}
                        className={`cursor-pointer py-1 px-2 ${isEnabled ? bgClass : 'bg-gray-100'} ${
                          isEnabled ? textClass : 'text-gray-500'
                        } border ${isEnabled ? borderClass : 'border-gray-300'}`}
                        onClick={() => toggleCategory(calType.id)}
                      >
                        {calType.emoji} {calType.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {MONTHS.map((_, index) => (
                  <MonthCalendar 
                    key={index} 
                    month={index} 
                    year={year} 
                    currentDate={currentDate}
                    onDateClick={handleDateClick}
                    enabledCategories={enabledCategories}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="filters" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Categories</CardTitle>
                  <CardDescription>Select which categories to display on the calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 space-x-2">
                    <Button size="sm" variant="outline" onClick={selectAllCategories}>Select All</Button>
                    <Button size="sm" variant="outline" onClick={clearAllCategories}>Clear All</Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {CALENDAR_TYPES.map((calType) => {
                      const colorClasses = calType.color.split(' ');
                      const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
                      const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
                      const borderClass = colorClasses.find(c => c.startsWith('border-')) || '';
                      
                      return (
                        <div 
                          key={calType.id}
                          className={`p-3 border rounded-lg ${
                            enabledCategories.includes(calType.id) ? borderClass : 'border-gray-200'
                          } ${
                            enabledCategories.includes(calType.id) ? bgClass+'/30' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <Checkbox 
                              id={`calendar-${calType.id}`}
                              checked={enabledCategories.includes(calType.id)}
                              onCheckedChange={() => toggleCategory(calType.id)}
                              className={enabledCategories.includes(calType.id) ? bgClass : ''}
                            />
                            <div>
                              <label 
                                htmlFor={`calendar-${calType.id}`}
                                className={`font-medium block cursor-pointer ${
                                  enabledCategories.includes(calType.id) ? textClass : 'text-gray-700'
                                }`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  {calType.emoji} {calType.name}
                                </span>
                              </label>
                              <p className="text-sm text-gray-600">{calType.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="special" className="mt-4">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Special Dates in {year}</CardTitle>
                    <CardDescription>View all special dates by category</CardDescription>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <div className="flex border rounded-md overflow-hidden">
                      <Button 
                        variant={sortMethod === 'date' ? 'default' : 'ghost'} 
                        size="sm"
                        onClick={() => setSortMethod('date')}
                        className="rounded-none"
                      >
                        Soonest
                      </Button>
                      <Button 
                        variant={sortMethod === 'category' ? 'default' : 'ghost'} 
                        size="sm"
                        onClick={() => setSortMethod('category')}
                        className="rounded-none"
                      >
                        Category
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {enabledCategories.length === 0 ? (
                    <div className="text-center p-6 text-gray-500">
                      <p>No calendar categories selected. Go to the "Calendar Filters" tab to select categories.</p>
                    </div>
                  ) : sortMethod === 'category' ? (
                    // By Category View - Group events by their category
                    CALENDAR_TYPES.filter(calType => enabledCategories.includes(calType.id)).map((calType) => {
                      // Get special dates for this category
                      const today = new Date();
                      today.setHours(0, 0, 0, 0); // Set to start of day for comparison
                      
                      const categoryDates = SPECIAL_DATES.filter(date => {
                        // Only include dates in this category
                        if (!date.categories.includes(calType.id)) return false;
                        
                        // Parse this date and determine if it's in the current year or future
                        const eventDate = new Date(date.date);
                        
                        // Only show dates from current year or future
                        return eventDate.getFullYear() >= today.getFullYear();
                      }).sort((a, b) => {
                        // Parse the dates in YYYY-MM-DD format and compare them
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        return dateA.getTime() - dateB.getTime(); // Sort from sooner to furthest
                      });
                      
                      if (categoryDates.length === 0) return null;
                      
                      const colorClasses = calType.color.split(' ');
                      const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
                      const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
                      const borderClass = colorClasses.find(c => c.startsWith('border-')) || '';
                      
                      return (
                        <div key={calType.id} className="mb-6">
                          <h3 className={`text-lg font-semibold mb-3 ${textClass}`}>{calType.name}</h3>
                          <div className="space-y-3">
                            {categoryDates.map((date, index) => (
                              <div 
                                key={index} 
                                className={`p-3 border ${borderClass} ${bgClass} rounded-lg hover:${bgClass}/80 cursor-pointer`}
                                onClick={() => {
                                  const [year, month, day] = date.date.split('-').map(Number);
                                  handleDateClick(new Date(year, month - 1, day));
                                }}
                              >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                  <div>
                                    <h3 className={`font-semibold ${textClass}`}>{date.name}</h3>
                                    <p className={`${textClass}/80 text-sm`}>{date.description}</p>
                                  </div>
                                  <div className="flex items-center">
                                    <Badge className={`${bgClass} ${textClass} hover:${bgClass}/80 font-medium border-2 px-2 py-1 shadow-sm`}>
                                      {calType.emoji} {format(
                                        (() => {
                                          const [year, month, day] = date.date.split('-').map(Number);
                                          return new Date(year, month - 1, day);
                                        })(), 
                                        'MMMM d'
                                      )}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    // By Date View - All events sorted chronologically regardless of category
                    <div className="space-y-6">
                      {(() => {
                        // Get current date to filter out past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        
                        // Get all special dates from enabled categories
                        const allDates = SPECIAL_DATES.filter(date => {
                          // Check if this date belongs to any enabled category
                          const hasEnabledCategory = date.categories.some(
                            cat => enabledCategories.includes(cat as CalendarType)
                          );
                          if (!hasEnabledCategory) return false;
                          
                          // Include all dates from current year or future
                          const eventDate = new Date(date.date);
                          return eventDate.getFullYear() >= today.getFullYear();
                        });
                        
                        // Separate future and past events
                        const upcomingDates = allDates
                          .filter(date => {
                            const eventDate = new Date(date.date);
                            return eventDate >= today;
                          })
                          .sort((a, b) => {
                            // Sort by date (soonest first)
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
                            return dateA.getTime() - dateB.getTime();
                          });
                        
                        const pastDates = allDates
                          .filter(date => {
                            const eventDate = new Date(date.date);
                            return eventDate < today;
                          })
                          .sort((a, b) => {
                            // Sort by date (most recent first)
                            const dateA = new Date(a.date);
                            const dateB = new Date(b.date);
                            return dateB.getTime() - dateA.getTime();
                          });
                        
                        if (upcomingDates.length === 0 && pastDates.length === 0) {
                          return (
                            <div className="text-center p-6 text-gray-500">
                              <p>No events found for the selected categories.</p>
                            </div>
                          );
                        }
                        
                        // Function to render event cards
                        const renderEventCard = (date: typeof SPECIAL_DATES[0], index: number, isPast = false) => {
                          // Find the category for this date to get its color
                          const category = date.categories[0] as CalendarType;
                          const calType = CALENDAR_TYPES.find(c => c.id === category);
                          
                          if (!calType) return null;
                          
                          const colorClasses = calType.color.split(' ');
                          const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
                          const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
                          const borderClass = colorClasses.find(c => c.startsWith('border-')) || '';
                          
                          // Apply opacity for past events
                          const opacityClass = isPast ? 'opacity-60' : '';
                          
                          return (
                            <div 
                              key={index} 
                              className={`p-3 border ${borderClass} ${bgClass} rounded-lg hover:${bgClass}/80 cursor-pointer ${opacityClass}`}
                              onClick={() => {
                                const [year, month, day] = date.date.split('-').map(Number);
                                handleDateClick(new Date(year, month - 1, day));
                              }}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className={`font-semibold ${textClass}`}>{date.name}</h3>
                                    <Badge variant="outline" className={`${textClass}`}>
                                      {calType.emoji} {calType.name}
                                    </Badge>
                                  </div>
                                  <p className={`${textClass}/80 text-sm`}>{date.description}</p>
                                </div>
                                <div className="flex items-center">
                                  <Badge className={`${bgClass} ${textClass} hover:${bgClass}/80 font-medium border-2 px-2 py-1 shadow-sm`}>
                                    {calType.emoji} {format(
                                      (() => {
                                        const [year, month, day] = date.date.split('-').map(Number);
                                        return new Date(year, month - 1, day);
                                      })(), 
                                      'MMMM d'
                                    )}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          );
                        };
                        
                        return (
                          <>
                            {upcomingDates.length > 0 && (
                              <div className="space-y-3">
                                <h3 className="text-xl font-semibold text-primary">Upcoming Events</h3>
                                <div className="space-y-3">
                                  {upcomingDates.map((date, index) => renderEventCard(date, index))}
                                </div>
                              </div>
                            )}
                            
                            {pastDates.length > 0 && (
                              <div className="space-y-3 mt-8">
                                <h3 className="text-xl font-semibold text-muted-foreground">Past Events</h3>
                                <div className="space-y-3">
                                  {pastDates.map((date, index) => renderEventCard(date, index, true))}
                                </div>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Date Information Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
              {selectedDate && (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-xl">
                      {format(selectedDate, 'MMMM d, yyyy')}
                    </DialogTitle>
                    <DialogDescription>
                      Date Information
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-4">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Date</h3>
                        <p className="text-xl">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                      </div>
                      
                      {specialEvents && specialEvents.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold mb-2">
                            {specialEvents.length > 1 
                              ? `${specialEvents.length} Events on This Date` 
                              : 'Event on This Date'}
                          </h3>
                          
                          {specialEvents.map((event, index) => (
                            <div key={index} className={`p-4 rounded-lg border ${getSpecialDateColor(event)}`}>
                              <h3 className="text-lg font-semibold mb-2">{event.name}</h3>
                              <p>{event.description}</p>
                              <div className="mt-2">
                                {event.categories.map((category) => {
                                  const calType = CALENDAR_TYPES.find(c => c.id === category);
                                  if (!calType) return null;
                                  
                                  const colorClasses = calType.color.split(' ');
                                  const bgClass = colorClasses.find(c => c.startsWith('bg-')) || '';
                                  const textClass = colorClasses.find(c => c.startsWith('text-')) || '';
                                  
                                  return (
                                    <Badge key={category} className={`mr-2 ${bgClass} ${textClass} font-medium border-2 px-2 py-1 shadow-sm`}>
                                      {calType.emoji} {calType.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {(!specialEvents || specialEvents.length === 0) && (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <p className="text-gray-600">No special events on this date.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}