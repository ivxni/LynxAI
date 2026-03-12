/**
 * Einfache Base64-Kodierung und -Dekodierung ohne Abhängigkeiten von nativen Modulen
 */

export const Base64 = {
  // Standard Base64-Zeichen
  chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

  /**
   * Base64-Kodierung eines Strings
   */
  encode: function(input: string): string {
    let output = '';
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;

    // Einfache UTF-16 zu UTF-8 Konvertierung
    input = this.utf16to8(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = i < input.length ? input.charCodeAt(i++) : 0;
      chr3 = i < input.length ? input.charCodeAt(i++) : 0;

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
        this.chars.charAt(enc1) +
        this.chars.charAt(enc2) +
        this.chars.charAt(enc3) +
        this.chars.charAt(enc4);
    }

    return output;
  },

  /**
   * Base64-Dekodierung zu einem String
   */
  decode: function(input: string): string {
    let output = '';
    let chr1, chr2, chr3;
    let enc1, enc2, enc3, enc4;
    let i = 0;

    // Entferne alle Zeichen, die nicht im Base64-Alphabet sind
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

    while (i < input.length) {
      enc1 = this.chars.indexOf(input.charAt(i++));
      enc2 = this.chars.indexOf(input.charAt(i++));
      enc3 = this.chars.indexOf(input.charAt(i++));
      enc4 = this.chars.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    // UTF-8 zu UTF-16 Konvertierung
    output = this.utf8to16(output);

    return output;
  },

  /**
   * UTF-16 zu UTF-8 Konvertierung
   */
  utf16to8: function(str: string): string {
    let out = '';
    let len = str.length;

    for (let i = 0; i < len; i++) {
      const c = str.charCodeAt(i);
      if ((c >= 0x0001) && (c <= 0x007F)) {
        out += str.charAt(i);
      } else if (c > 0x07FF) {
        out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
        out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      } else {
        out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
        out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
      }
    }
    return out;
  },

  /**
   * UTF-8 zu UTF-16 Konvertierung
   */
  utf8to16: function(str: string): string {
    let out = '';
    let i = 0;
    let len = str.length;
    let c, char2, char3;

    while (i < len) {
      c = str.charCodeAt(i++);
      switch (c >> 4) {
        case 0: case 1: case 2: case 3: case 4: case 5: case 6: case 7:
          // 0xxxxxxx
          out += str.charAt(i - 1);
          break;
        case 12: case 13:
          // 110x xxxx   10xx xxxx
          char2 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
          break;
        case 14:
          // 1110 xxxx  10xx xxxx  10xx xxxx
          char2 = str.charCodeAt(i++);
          char3 = str.charCodeAt(i++);
          out += String.fromCharCode(((c & 0x0F) << 12) |
            ((char2 & 0x3F) << 6) |
            ((char3 & 0x3F) << 0));
          break;
      }
    }

    return out;
  }
};

// Default export
export default Base64; 