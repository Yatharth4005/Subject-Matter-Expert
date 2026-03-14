"""Unit tests for AudioProcessor."""

import base64
import pytest

from services.audio_processor import AudioProcessor


class TestAudioProcessor:
    def setup_method(self):
        self.processor = AudioProcessor()

    def test_encode_base64(self):
        data = b"test audio data"
        encoded = self.processor.encode_base64(data)
        assert isinstance(encoded, str)
        decoded = base64.b64decode(encoded)
        assert decoded == data

    def test_decode_base64(self):
        original = b"hello world audio"
        encoded = base64.b64encode(original).decode("utf-8")
        decoded = self.processor.decode_base64(encoded)
        assert decoded == original

    def test_roundtrip(self):
        data = b"\x00\x01\x02\x03\xff\xfe\xfd"
        encoded = self.processor.encode_base64(data)
        decoded = self.processor.decode_base64(encoded)
        assert decoded == data

    def test_validate_audio_valid(self):
        data = b"\x00" * 1000
        assert self.processor.validate_audio(data) is True

    def test_validate_audio_empty(self):
        assert self.processor.validate_audio(b"") is False

    def test_validate_audio_too_large(self):
        big_data = b"\x00" * (11 * 1024 * 1024)  # 11MB
        assert self.processor.validate_audio(big_data) is False

    def test_validate_audio_max_size(self):
        max_data = b"\x00" * (10 * 1024 * 1024)  # exactly 10MB
        assert self.processor.validate_audio(max_data) is True
